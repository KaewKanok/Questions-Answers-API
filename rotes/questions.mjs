import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const questionsRouter = Router();

questionsRouter.post("/", async (req, res) => {
  const newQuestion = {
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
  };
  if (!newQuestion.title || !newQuestion.description || !newQuestion.category) {
    return res.status(400).json({
      message: "Bad Request: Missing or invalid request data",
    });
  }
  try {
    const insertQuestion = await connectionPool.query(
      `INSERT INTO questions (title, description, category, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [
        newQuestion.title,
        newQuestion.description,
        newQuestion.category,
        newQuestion.created_at,
        newQuestion.updated_at,
      ]
    );
    const newQuestionId = insertQuestion.rows[0].id;
    const result = await connectionPool.query(
      `SELECT * FROM questions WHERE id = $1`,
      [newQuestionId]
    );
    return res.status(201).json({
      message: "Created: Question created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    return res.status(500).json({
      message:
        "Server could not create assignment due to a database connection error",
    });
  }
});

questionsRouter.get("/", async (req, res) => {
  let result;
  const title = req.query.title;
  const category = req.query.category;
  try {
    if (!title && !category) {
      const result = await connectionPool.query(`select * from questions`);
      return res.status(200).json({
        message: "OK: Successfully retrieved the list of questions.",
        data: result.rows,
      });
    }

    if (!title || !category) {
      return res
        .status(400)
        .json({ message: "Bad Request: Invalid query parameters." });
    }

    result = await connectionPool.query(
      `select * from questions 
                        where 
                            (title = $1)
                            and
                            (category = $2 or $2 is null)`,
      [title, category]
    );
    return res.status(200).json({
      message: "OK: Successfully retrieved the questions",
      data: result.rows,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server could not read questions because database connection",
    });
  }
});

questionsRouter.get("/:id", async (req, res) => {
  const questionsIdFromClient = req.params.id;
  try {
    const result = await connectionPool.query(
      `select * from questions where id = $1`,
      [questionsIdFromClient]
    );
    console.log(result);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Not Found: Question not found" });
    }
    return res.status(200).json({
      message: "OK: Successfully retrieved the question",
      data: result.rows,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server could not read questions because database connection",
    });
  }
});

questionsRouter.put("/:id", async (req, res) => {
  const questionsIdFromClient = req.params.id;
  const updateQuestion = { ...req.body, updated_at: new Date() };
  if (
    !updateQuestion.title ||
    !updateQuestion.description ||
    !updateQuestion.category
  ) {
    return res.status(400).json({
      message: "Bad Request: Missing or invalid request data",
    });
  }
  try {
    const upDateresult = await connectionPool.query(
      `update questions set title = $2,description = $3,category = $4,updated_at = $5 where id = $1`,
      [
        questionsIdFromClient,
        updateQuestion.title,
        updateQuestion.description,
        updateQuestion.category,
        updateQuestion.updated_at,
      ]
    );
    if (upDateresult.rowCount === 0) {
      return res.status(404).json({ message: "Not Found: Question not found" });
    }
    const result = await connectionPool.query(
      `SELECT * FROM questions WHERE id = $1`,
      [questionsIdFromClient]
    );
    return res.status(200).json({
      message: "OK: Successfully retrieved the question",
      data: result.rows,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server could not read questions because database connection",
    });
  }
});

questionsRouter.delete("/:id", async (req, res) => {
  const questionsIdFromClient = req.params.id;
  try {
    const result = await connectionPool.query(
      `delete from questions where id = $1`,
      [questionsIdFromClient]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Server could not find a requested assignment to delete",
      });
    }
    return res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Server could not read questions because database connection",
    });
  }
});

// questionsRouter.post("/questions/:id/answers"),
//   async (req, res) => {
//     try {
//       const newAnswer = {
//         ...req.body,
//         created_at: new Date(),
//         updated_at: new Date(),
//       };
//       const result = await connectionPool.query(
//         `SELECT * FROM questions WHERE id = $1`,
//         [questionsIdFromClient]
//       );
//     } catch (error) {
//       return res.status(500).json({
//         message: "Server could not read questions because database connection",
//       });
//     }
//   };
export default questionsRouter;
