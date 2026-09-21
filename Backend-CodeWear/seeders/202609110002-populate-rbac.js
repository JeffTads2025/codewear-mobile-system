'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const roles = [
      { name: 'admin', created_at: now, updated_at: now },
      { name: 'client', created_at: now, updated_at: now },
    ];
    const permissions = [
      'VIEW_ADMIN_DASHBOARD',
      'MANAGE_PRODUCTS',
      'MANAGE_ORDERS',
      'MANAGE_USERS',
      'VIEW_AUDIT_LOGS',
    ].map((name) => ({ name, created_at: now, updated_at: now }));

    await queryInterface.bulkInsert('roles', roles);
    await queryInterface.bulkInsert('permissions', permissions);

    const roleRows = await queryInterface.sequelize.query(
      'SELECT id, name FROM roles WHERE name IN (:names)',
      { replacements: { names: roles.map((role) => role.name) }, type: Sequelize.QueryTypes.SELECT }
    );
    const permissionRows = await queryInterface.sequelize.query(
      'SELECT id, name FROM permissions WHERE name IN (:names)',
      { replacements: { names: permissions.map((permission) => permission.name) }, type: Sequelize.QueryTypes.SELECT }
    );

    const roleByName = Object.fromEntries(roleRows.map((role) => [role.name, role.id]));
    const permissionByName = Object.fromEntries(permissionRows.map((permission) => [permission.name, permission.id]));

    await queryInterface.bulkInsert('role_permissions', permissions.map((permission) => ({
      role_id: roleByName.admin,
      permission_id: permissionByName[permission.name],
      created_at: now,
      updated_at: now,
    })));

    const users = await queryInterface.sequelize.query(
      'SELECT id, role FROM users',
      { type: Sequelize.QueryTypes.SELECT }
    );
    await queryInterface.bulkInsert('user_roles', users.map((user) => ({
      user_id: user.id,
      role_id: roleByName[user.role] || roleByName.client,
      created_at: now,
      updated_at: now,
    })));
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('user_roles', null, {});
    await queryInterface.bulkDelete('role_permissions', null, {});
    await queryInterface.bulkDelete('permissions', null, {});
    await queryInterface.bulkDelete('roles', null, {});
  },
};