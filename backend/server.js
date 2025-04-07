const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
require("dotenv").config({ path: "./config/.env" });

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "gpi",
});

db.connect((err) => {
  if (err) {
    console.error("Erreur de connexion à la base de données:", err);
    return;
  }
  console.log("Connecté à la base de données MySQL.");
});

// route pour le login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  db.query(
    "SELECT * FROM utilisateurs WHERE email = ? AND password = ?",
    [email, password],
    (error, results) => {
      if (error) return res.status(500).send(error);
      if (results.length > 0) {
        res.json({ success: true, user: results[0] });
      } else {
        res
          .status(401)
          .json({ success: false, message: "Identifiants incorrects" });
      }
    }
  );
});

// route pour mettre à jour un équipement
app.put("/api/equipement/:id", (req, res) => {
  const eqid = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res
      .status(400)
      .json({ success: false, message: "Nom et statut sont requis." });
  }
  db.query(
    "UPDATE equipement SET status = ? WHERE id = ?",
    [status, eqid],
    (error, results) => {
      if (error) return res.status(500).send(error);

      if (results.affectedRows > 0) {
        res.json({
          success: true,
          message: "Équipement mis à jour avec succès.",
        });
      } else {
        res
          .status(404)
          .json({ success: false, message: "Équipement non trouvé." });
      }
    }
  );
});

//route pour la liste des utilisateurs
app.get("/api/user", (req, res) => {
  const sql = "SELECT * FROM utilisateurs";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Message: "Erreur dans le serveur" });
    return res.json(result);
  });
});

//route pour les reporting
app.get("/api/reporting", (req, res) => {
  const sql = "SELECT * FROM reporting";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Message: "Erreur dans le serveur" });
    return res.json(result);
  });
});

//route pour la liste des equipement
app.get("/api/equipement", (req, res) => {
  const sql = "SELECT * FROM equipement";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Message: "Erreur dans le serveur" });
    return res.json(result);
  });
});
//route pour la liste des equipementTmeLine
app.get("/api/timeline", (req, res) => {
  const sql = "SELECT * FROM timeline";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Message: "Erreur dans le serveur" });
    return res.json(result);
  });
});
//route pour la liste des agence
app.get("/api/agence", (req, res) => {
  const sql = "SELECT * FROM agence";
  db.query(sql, (err, result) => {
    if (err) return res.json({ Message: "Erreur dans le serveur" });
    return res.json(result);
  });
});
// route pour récupérer un équipement par ID
app.get("/api/equipement/:id", (req, res) => {
  const eqid = req.params.id;
  const sql = "SELECT * FROM equipement WHERE id = ?";

  db.query(sql, [eqid], (err, result) => {
    if (err) {
      return res.status(500).json({ Message: "Erreur dans le serveur" });
    }
    if (result.length > 0) {
      return res.json(result[0]);
    } else {
      return res.status(404).json({ Message: "Équipement non trouvé" });
    }
  });
});

// route pour récupérer une timeline par ID d'équipement
app.get("/api/timeline/equipment/:id", (req, res) => {
  const eqid = req.params.id;
  const sql = "SELECT * FROM timeline WHERE equipment_id = ? ORDER BY id DESC";

  db.query(sql, [eqid], (err, result) => {
    if (err) {
      return res.status(500).json({ Message: "Erreur dans le serveur" });
    }
    if (result.length > 0) {
      return res.json(result);
    } else {
      return res
        .status(404)
        .json({ Message: "Aucune timeline trouvée pour cet équipement" });
    }
  });
});

// route pour récpérer le statut d'un équipement
app.get("/api/equipement/:id/status", (req, res) => {
  const eqid = req.params.id;
  const sql = `SELECT status, deploymentDuration, 
                    maintenanceSchedule, lifecycle 
                 FROM equipement 
                 WHERE id = ?`;

  db.query(sql, [eqid], (err, result) => {
    if (err) {
      return res.status(500).json({ Message: "Erreur dans le serveur" });
    }
    if (result.length > 0) {
      return res.json(result[0]);
    } else {
      return res.status(404).json({ Message: "Équipement non trouvé" });
    }
  });
});

// Route pour ajouter un nouvel équipement
app.post("/api/equipement/add", (req, res) => {
  const {
    name,
    type,
    status,
    user,
    purchaseDate,
    serialNumber,
    prestataire,
    lifecycle,
    deploymentDuration,
    maintenanceSchedule,
    lastUpdate,
  } = req.body;

  // Validation des champs requis
  if (
    !name ||
    !type ||
    !status ||
    !user ||
    !purchaseDate ||
    !serialNumber ||
    !prestataire ||
    !lifecycle ||
    !deploymentDuration ||
    !maintenanceSchedule ||
    !lastUpdate
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Tous les champs sont requis." });
  }

  // Requête SQL pour insérer un nouvel équipement
  const sql = `INSERT INTO equipement (name, type, status, user, purchaseDate, serialNumber, prestataire, lifecycle, deploymentDuration, maintenanceSchedule, lastUpdate) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    sql,
    [
      name,
      type,
      status,
      user,
      purchaseDate,
      serialNumber,
      prestataire,
      lifecycle,
      deploymentDuration,
      maintenanceSchedule,
      lastUpdate,
    ],
    (err, results) => {
      if (err) {
        console.error("Erreur lors de l'insertion :", err);
        return res
          .status(500)
          .json({ Message: "Erreur dans le serveur", error: err });
      }
      res
        .status(201)
        .json({
          success: true,
          message: "Équipement ajouté avec succès.",
          id: results.insertId,
        });
    }
  );
});

// route pour supprimer un équipement par ID
app.delete("/api/equipement/:id", (req, res) => {
  const eqid = req.params.id;
  const sql = "DELETE FROM equipement WHERE id = ?";

  db.query(sql, [eqid], (err, results) => {
    if (err) {
      return res.status(500).json({ Message: "Erreur dans le serveur" });
    }
    if (results.affectedRows > 0) {
      return res.json({
        success: true,
        message: "Équipement supprimé avec succès.",
      });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Équipement non trouvé." });
    }
  });

  // ajouter  timeline
  app.post("/api/timeline/add", (req, res) => {
    const {
      equipmentId,
      date,
      type,
      title,
      description,
      actor,
      location,
      icon,
    } = req.body;

    if (
      !equipmentId ||
      !date ||
      !type ||
      !title ||
      !description ||
      !actor ||
      !location ||
      !icon
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Tous les champs sont requis." });
    }

    const sql = `INSERT INTO timeline (equipment_id, date, type, title, description, actor, location, icon) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(
      sql,
      [equipmentId, date, type, title, description, actor, location, icon],
      (err, results) => {
        if (err) {
          return res.status(500).json({ Message: "Erreur dans le serveur" });
        }
        res
          .status(201)
          .json({
            success: true,
            message: "Entrée ajoutée à la timeline avec succès.",
            id: results.insertId,
          });
      }
    );
  });
});
app.listen(process.env.PORT, () => {
  console.log(`listening on port ${process.env.PORT}`);
});
