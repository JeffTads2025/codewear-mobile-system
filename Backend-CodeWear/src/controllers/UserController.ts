import { Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Op, fn, col, where, type WhereOptions } from 'sequelize';
import User from '../models/UserModel';
import Cart from '../models/CartModel';
import Order from '../models/OrderModel';
import OrderItem from '../models/OrderItemModel';
import {
    buildCancelledAccountData,
    getActiveClientWhereClause,
} from '../utils/accountCancellation';
import { validateEmail, validateCPF, validatePasswordLevel, validatePhone } from '../utils/validators';
import { AuthRequest } from '../types';

interface UserUpdatePayload {
    name?: string;
    password?: string;
    phone?: string;
    address?: string;
    cpf?: string;
}

interface CreateUserPayload {
    name?: string;
    email?: string;
    password?: string;
    cpf?: string;
    phone?: string;
    address?: string;
}

interface NormalizedCreateUserPayload {
    name: string;
    email: string;
    password: string;
    cpf: string;
    phone: string;
    address: string;
}

function getAuthorizedUserId(req: AuthRequest): number | null {
    return req.user?.id ?? null;
}

function normalizeCreateUserPayload(payload: CreateUserPayload): NormalizedCreateUserPayload | null {
    const { name, email, password, cpf, phone, address } = payload;

    if (!name || !email || !password || !cpf || !phone || !address) {
        return null;
    }

    return {
        name,
        email: email.toLowerCase().trim(),
        password: password.trim(),
        cpf: cpf.replace(/\D/g, ''),
        phone,
        address,
    };
}

async function findActiveUserById(userId: number): Promise<User | null> {
    const user = await User.findByPk(userId);

    if (!user || user.isActive === false) {
        return null;
    }

    return user;
}

function buildUserListWhereClause(search: string): WhereOptions {
    if (!search) {
        return {
            role: 'client',
            isActive: true,
        };
    }

    const normalizedSearch = search.toLowerCase();

    return {
        role: 'client',
        isActive: true,
        [Op.or]: [
            where(fn('lower', col('name')), { [Op.like]: `%${normalizedSearch}%` }),
            where(fn('lower', col('email')), { [Op.like]: `%${normalizedSearch}%` }),
            where(fn('lower', col('cpf')), { [Op.like]: `%${normalizedSearch}%` })
        ]
    };
}

function getDuplicateFieldMessage(error: unknown): string | null {
    const databaseError = error as { name?: string; fields?: Record<string, unknown> };
    if (databaseError.name !== 'SequelizeUniqueConstraintError') return null;
    if (databaseError.fields?.cpf !== undefined) return 'Este CPF já está cadastrado em nossa base de dados.';
    if (databaseError.fields?.email !== undefined) return 'Este e-mail já está cadastrado em nossa base de dados.';
    return 'Já existe um usuário com estes dados.';
}

/**
 * CADASTRO DE USUÁRIO
 */
export const createUser = async (req: AuthRequest, res: Response) => {
    try {
        const normalizedPayload = normalizeCreateUserPayload(req.body as CreateUserPayload);

        if (!normalizedPayload) {
            return res.status(400).json({ message: "Todos os campos são obrigatórios." });
        }

        const { name, email, password, cpf, phone, address } = normalizedPayload;

        if (!validateEmail(email)) return res.status(400).json({ message: "Formato de e-mail inválido." });
        if (!validateCPF(cpf)) return res.status(400).json({ message: "CPF inválido." });
        if (!validatePhone(phone)) return res.status(400).json({ message: "Telefone inválido." });
        if (!validatePasswordLevel(password)) return res.status(400).json({ message: "Senha muito fraca." });

        const [cpfExists, emailExists] = await Promise.all([
            User.findOne({ where: { cpf } }),
            User.findOne({ where: { email } }),
        ]);

        if (cpfExists) {
            return res.status(400).json({ message: "Este CPF já está cadastrado em nossa base de dados." });
        }

        if (emailExists) {
            return res.status(400).json({ message: "Este e-mail já está cadastrado em nossa base de dados." });
        }

        const newUser = await User.create({
            name,
            email,
            password,
            cpf,
            phone,
            address,
            role: 'client'
        });

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({ message: 'JWT_SECRET não está configurado no servidor.' });
        }

        const token = jwt.sign(
            { id: newUser.id, name: newUser.name, role: newUser.role },
            jwtSecret,
            { expiresIn: '1d' }
        );

        return res.status(201).json({
            message: "Usuário criado com sucesso!",
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                phone: newUser.phone,
                address: newUser.address,
                avatarUrl: newUser.avatarUrl,
            },
        });

    } catch (error) {
        console.error("ERRO NO CADASTRO:", error);
        const duplicateMessage = getDuplicateFieldMessage(error);
        if (duplicateMessage) return res.status(409).json({ message: duplicateMessage });
        return res.status(500).json({ message: "Erro interno ao criar usuário." });
    }
};


// LOGIN DE USUÁRIO

export const loginUser = async (req: AuthRequest, res: Response) => {
    try {
        const { email, password } = req.body as { email?: unknown; password?: unknown };
        if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
            return res.status(400).json({ message: "E-mail e senha são obrigatórios." });
        }

        const cleanEmail = email.toLowerCase().trim();
        const rawPassword = String(password || '');
        const cleanPassword = rawPassword.trim();
        const user = await User.findOne({ where: { email: cleanEmail } });

        if (!user) return res.status(401).json({ message: "E-mail não encontrado." });
        if (user.isActive === false) return res.status(403).json({ message: "Esta conta está inativa." });

        let isMatch = await bcrypt.compare(rawPassword, user.password);
        if (!isMatch && cleanPassword !== rawPassword) {
            isMatch = await bcrypt.compare(cleanPassword, user.password);
        }

        if (!isMatch) return res.status(401).json({ message: "Senha incorreta." });

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return res.status(500).json({ message: 'JWT_SECRET não está configurado no servidor.' });
        }

        const token = jwt.sign(
            { id: user.id, name: user.name, role: user.role },
            jwtSecret,
            { expiresIn: '1d' }
        );

        return res.status(200).json({
            message: "Login realizado!",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address
                , avatarUrl: user.avatarUrl
            }
        });
    } catch (error: unknown) {
        console.error('Erro ao processar login:', error instanceof Error ? error.message : error);
        return res.status(500).json({ message: "Erro ao processar o login." });
    }
};


// OBTER DADOS DO USUÁRIO LOGADO

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const userId = getAuthorizedUserId(req);
        if (!userId) return res.status(401).json({ message: "Não autorizado." });

        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] }
        });

        if (!user) return res.status(404).json({ message: "Usuário não encontrado." });
        if (user.isActive === false) return res.status(404).json({ message: "Usuário não encontrado." });

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: "Erro ao buscar dados do perfil." });
    }
};


// ATUALIZAR PERFIL

export const updateUser = async (req: AuthRequest, res: Response) => {
    try {
        const userId = getAuthorizedUserId(req);
        if (!userId) return res.status(401).json({ message: "Não autorizado." });

        const { name, password, phone, address, cpf } = req.body;
        const user = await findActiveUserById(userId);

        if (!user) return res.status(404).json({ message: "Usuário não encontrado." });

        const updateData: UserUpdatePayload = { name, phone, address };

        if (cpf) {
            const normalizedCpf = cpf.replace(/\D/g, '');
            if (!validateCPF(normalizedCpf)) return res.status(400).json({ message: 'CPF inválido.' });

            const cpfExists = await User.findOne({
                where: { cpf: normalizedCpf, id: { [Op.ne]: userId } },
            });
            if (cpfExists) return res.status(409).json({ message: 'Este CPF já está cadastrado em nossa base de dados.' });
            updateData.cpf = normalizedCpf;
        }

        if (password) {
            const cleanPassword = password.trim();

            if (!validatePasswordLevel(cleanPassword)) {
                return res.status(400).json({ message: "Senha muito fraca." });
            }

            updateData.password = cleanPassword;
        }

        await user.update(updateData);
        return res.status(200).json({ message: "Perfil atualizado com sucesso!" });
    } catch (error) {
        const duplicateMessage = getDuplicateFieldMessage(error);
        if (duplicateMessage) return res.status(409).json({ message: duplicateMessage });
        return res.status(500).json({ message: "Erro ao atualizar o perfil." });
    }
};


//CANCELAR CONTA DO USUÁRIO LOGADO

export const cancelMyAccount = async (req: AuthRequest, res: Response) => {
    try {
        const userId = getAuthorizedUserId(req);
        if (!userId) return res.status(401).json({ message: "Não autorizado." });

        const user = await User.findByPk(userId);

        if (!user) return res.status(404).json({ message: "Usuário não encontrado." });
        if (user.isActive === false) {
            return res.status(400).json({ message: "Esta conta já foi cancelada." });
        }

        await user.update({
            ...buildCancelledAccountData(user),
            isActive: false,
        });

        return res.status(200).json({ message: "Conta cancelada com sucesso." });
    } catch (error) {
        console.error('Erro ao cancelar conta:', error);
        return res.status(500).json({ message: "Erro ao cancelar conta." });
    }
};

export const deleteTestUser = async (req: AuthRequest, res: Response) => {
    try {
        const secret = String(req.headers['x-e2e-secret'] || '');
        const expectedSecret = process.env.E2E_SECRET || 'codewear-test-secret';

        if (secret !== expectedSecret) {
            return res.status(403).json({ message: 'Acesso negado ao endpoint de testes.' });
        }

        const { email, password } = req.body as { email?: string; password?: string };

        if (!email || !password) {
            return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
        }

        const cleanEmail = email.toLowerCase().trim();
        const user = await User.findOne({ where: { email: cleanEmail } });

        if (!user) {
            return res.status(404).json({ message: 'Usuário de teste não encontrado.' });
        }

        if (!cleanEmail.endsWith('@codewear.test')) {
            return res.status(403).json({ message: 'Somente contas de teste podem ser removidas aqui.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Senha incorreta.' });
        }

        const orders = await Order.findAll({ where: { userId: user.id } });
        const orderIds = orders.map((order) => order.id);

        if (orderIds.length > 0) {
            await OrderItem.destroy({ where: { orderId: orderIds } });
            await Order.destroy({ where: { userId: user.id } });
        }

        await Cart.destroy({ where: { userId: user.id } });
        await user.destroy();

        return res.status(200).json({ message: 'Usuário de teste removido com sucesso.' });
    } catch (error) {
        console.error('Erro ao excluir usuário de teste:', error);
        return res.status(500).json({ message: 'Erro ao excluir usuário de teste.' });
    }
};


//LISTAR CLIENTES (Admin)


export const listUsersAdmin = async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const search = (req.query.search as string) || '';


        const queryLimit = parseInt(req.query.limit as string);
        const limit = isNaN(queryLimit) ? 5 : queryLimit;

        const offset = (page - 1) * limit;


        const activeClientWhereClause = getActiveClientWhereClause();
        const totalCountInDB = await User.count({ where: activeClientWhereClause });

        const whereClause = buildUserListWhereClause(search);

        const { count, rows } = await User.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            attributes: ['id', 'name', 'email', 'cpf', 'address', 'createdAt', 'phone'],
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            users: rows,
            totalPages: Math.ceil(count / limit),
            totalCount: totalCountInDB
        });
    } catch (error) {
        console.error("Erro ao listar clientes:", error);
        return res.status(500).json({ message: "Erro ao listar clientes no banco." });
    }
};


//ESTATÍSTICAS DO DASHBOARD (Admin)

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
        const totalClients = await User.count({
            where: getActiveClientWhereClause()
        });

        return res.status(200).json({
            totalClients
        });
    } catch (error) {
        console.error("Erro ao carregar estatísticas do dashboard:", error);
        return res.status(500).json({ message: "Erro interno ao processar estatísticas." });
    }
};