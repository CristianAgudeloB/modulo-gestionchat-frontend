const { executeQuery } = require('../config/database.connect');

exports.createGroup = async (req, res) => {
  try {
    const { groupName, creatorId, memberIds = [] } = req.body;
    
    if (!creatorId) {
      return res.status(400).json({ error: 'Se requiere ID de creador' });
    }
    // Generar nuevo ID de grupo
    const groupIdResult = await executeQuery(
      "SELECT NVL(MAX(CODGRUPO), 0) + 1 AS nextId FROM GRUPO"
    );
    const groupId = groupIdResult.rows[0].NEXTID;

    // Crear el grupo
    await executeQuery(
      `INSERT INTO GRUPO (CODGRUPO, NOMGRUPO, CONSECUSER, FECHAREGGRUPO, IMAGGRUPO) 
       VALUES (:groupId, :groupName, :creatorId, SYSDATE, EMPTY_BLOB())`,
      { groupId, groupName, creatorId }
    );

    // Agregar creador como miembro
    await executeQuery(
      `INSERT INTO PERTENECE (CODGRUPO, CONSECUSER) 
       VALUES (:groupId, :creatorId)`,
      { groupId, creatorId }
    );

        // Agregar miembros seleccionados
    const allMembers = [...new Set([creatorId, ...memberIds])];
    for (const memberId of allMembers) {
      if (memberId !== creatorId) {
        await executeQuery(
          `INSERT INTO PERTENECE (CODGRUPO, CONSECUSER) 
           VALUES (:groupId, :memberId)`,
          { groupId, memberId }
        );
      }
    }

    res.status(201).json({ success: true, groupId });
  } catch (error) {
    console.error('Error al crear grupo:', error);
    res.status(500).json({ error: 'Error al crear grupo' });
  }
};

exports.addMemberToGroup = async (req, res) => {
  try {
    const { groupId, userId } = req.body;
    
    // Verificar que el usuario no está ya en el grupo
    const alreadyMember = await executeQuery(
      "SELECT 1 FROM PERTENECE WHERE CODGRUPO = :groupId AND CONSECUSER = :userId",
      { groupId, userId }
    );
    
    if (alreadyMember.rows.length > 0) {
      return res.status(400).json({ error: 'El usuario ya pertenece al grupo' });
    }

    await executeQuery(
      `INSERT INTO PERTENECE (CODGRUPO, CONSECUSER) 
       VALUES (:groupId, :userId)`,
      { groupId, userId }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error al agregar miembro al grupo:', error);
    res.status(500).json({ error: 'Error al agregar miembro' });
  }
};

exports.getUserGroups = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const sql = `
      SELECT g.CODGRUPO, g.NOMGRUPO, g.CONSECUSER AS CREADOR, g.FECHAREGGRUPO
      FROM GRUPO g
      JOIN PERTENECE p ON g.CODGRUPO = p.CODGRUPO
      WHERE p.CONSECUSER = :userId
      ORDER BY g.FECHAREGGRUPO DESC
    `;
    
    const result = await executeQuery(sql, { userId });
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener grupos del usuario:', error);
    res.status(500).json({ error: 'Error al obtener grupos' });
  }
};

exports.getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    const sql = `
      SELECT u.CONSECUSER, u.NOMBRE, u.APELLIDO
      FROM USUARIO u
      JOIN PERTENECE p ON u.CONSECUSER = p.CONSECUSER
      WHERE p.CODGRUPO = :groupId
    `;
    
    const result = await executeQuery(sql, { groupId });
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener miembros del grupo:', error);
    res.status(500).json({ error: 'Error al obtener miembros' });
  }
};