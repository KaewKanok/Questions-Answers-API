import { Router } from "express";
import connectionPool from "../utils/db.mjs";

const answersRouter = Router();

async function getUpVoteDownVoteAnswer(question_id) {
  let upvotes = 0;
  let downvotes = 0;
  const upVote = await connectionPool.query(
    `SELECT answer_id, count(vote) as total_vote FROM answer_votes where answer_id =$1 and vote=1 group by answer_id`,
    [question_id]
  );
  const downVote = await connectionPool.query(
    `SELECT answer_id, count(vote) as total_vote FROM answer_votes where answer_id =$1 and vote=-1 group by answer_id`,
    [question_id]
  );
  if (upVote.rows.length !== 0) {
    upvotes = Number(upVote.rows[0].total_vote);
  }
  if (downVote.rows.length !== 0) {
    downvotes = Number(downVote.rows[0].total_vote);
  }
  return { upvotes, downvotes };
}

answersRouter.post("/:id/upvote", async (req, res) => {
  const answersIdFromClient = req.params.id;
  try {
    const answer = await connectionPool.query(
      `select * from answers where id = $1`,
      [answersIdFromClient]
    );
    if (answer.rows === 0) {
      return res.status(404).json({
        message: "Not Found: Question not found.",
      });
    }
    const newVote = {
      vote: 1,
      created_at: new Date(),
      updated_at: new Date(),
    };
    await connectionPool.query(
      `INSERT INTO answer_votes (answer_id,vote, created_at, updated_at)
           VALUES ($1, $2, $3,$4)`,
      [
        answersIdFromClient,
        newVote.vote,
        newVote.created_at,
        newVote.updated_at,
      ]
    );
    const getVote = await getUpVoteDownVoteAnswer(answersIdFromClient);

    return res.status(200).json({
      message: "OK: Successfully upvoted the question.",
      data: { ...answer.rows[0], ...getVote },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server could not read answers because database connection",
    });
  }
});

answersRouter.post("/:id/downvote", async (req, res) => {
  const answersIdFromClient = req.params.id;
  try {
    const answer = await connectionPool.query(
      `select * from answers where id = $1`,
      [answersIdFromClient]
    );
    if (answer.rows === 0) {
      return res.status(404).json({
        message: "Not Found: Question not found.",
      });
    }
    const newVote = {
      vote: -1,
      created_at: new Date(),
      updated_at: new Date(),
    };
    await connectionPool.query(
      `INSERT INTO answer_votes (answer_id,vote, created_at, updated_at)
             VALUES ($1, $2, $3,$4)`,
      [
        answersIdFromClient,
        newVote.vote,
        newVote.created_at,
        newVote.updated_at,
      ]
    );
    const getVote = await getUpVoteDownVoteAnswer(answersIdFromClient);

    return res.status(200).json({
      message: "OK: Successfully upvoted the question.",
      data: { ...answer.rows[0], ...getVote },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server could not read answers because database connection",
    });
  }
});

export default answersRouter;
