const express = require("express");
const passport = require("passport");
const router = express.Router();
const ActivityObject = require("../models/activity");

const SERVER_ERROR = "SERVER_ERROR";
const PROJECT_ALREADY_EXISTS = "PROJECT_ALREADY_EXISTS";

router.get("/", passport.authenticate("user", { session: false }), async (req, res) => {
  try {
    const queryObj = { ...req.query };

    let data;
    const match = {
      organisation: queryObj.organisation,
      $expr: { $and: [{ $eq: ["$month_document", "$month_date"] }, { $eq: ["$year_document", "$year_date"] }] },
    };

    let userStats = {
      userStats: {
        $map: {
          input: "$detail",
          as: "array1",
          in: {
            $map: {
              input: { $filter: { input: "$$array1.userAction", as: "value", cond: { $eq: ["$$value.userId", req.query.userId] } } },
              as: "array2",
              in: "$$array2",
            },
          },
        },
      },
    };
    if (queryObj.projectId !== "undefined") match.projectId = queryObj.projectId;

    data = await ActivityObject.aggregate([
      {
        $addFields: {
          month_date: { $month: new Date(parseInt(req.query.date)) },
          month_document: { $month: "$date" },
          year_date: { $year: new Date(parseInt(req.query.date)) },
          year_document: { $year: "$date" },
        },
      },

      { $match: match },
      {
        $addFields: userStats,
      },
      {
        $addFields: {
          formatStats: {
            $map: {
              input: "$userStats",
              as: "array1",
              in: { $arrayElemAt: ["$$array1", 0] },
            },
          },
        },
      },
      //   , {$project: { projectId:1,formatStats:1}},
    ]);

    return res.status(200).send({ ok: true, data });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

module.exports = router;
