const express = require("express");
const passport = require("passport");
const router = express.Router();

const ActivityObject = require("../models/activity");
const ProjectObject = require("../models/project");

const SERVER_ERROR = "SERVER_ERROR";

router.get("/stats", passport.authenticate("user", { session: false }), async (req, res) => {
  try {
    const queryObj = { ...req.query };
    console.log("🚀 ~ file: activity.js:13 ~ router.get ~ queryObj", queryObj)
    let data;
    if (req.query.filter === "users") {
      data = await ActivityObject.aggregate([
        {
          $addFields: {
            month_date: { $month: new Date(parseInt(req.query.date)) },
            month_document: { $month: "$date" },
            year_date: { $year: new Date(parseInt(req.query.date)) },
            year_document:  { $year: "$date" },
          },
        },
        { $match: { organisation: queryObj.organisation, 
             $expr: { $eq: [ "$month_document", "$month_date" ] } ,     
             $expr: { $eq: [ "$year_document", "$year_date" ] } , 
        } },
        {
          $addFields: {
            userStats: {
              $map: {
                input: "$detail",
                as: "array1",
                in: {
                  $map: {
                    input: "$$array1.userAction",
                    as: "array2",
                    in: "$$array2",
                  },
                },
              },
            },
          },

        },
        // {$project: {userStats: 1, projectId:1}},
      ]);
    }

    return res.status(200).send({ ok: true, data });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});


router.get("/", passport.authenticate("user", { session: false }), async (req, res) => {
  try {
    const query = {};
    if (req.query.userId) query.user = req.query.userId;
    if (req.query.projectId) query.projectId = req.query.projectId;
    if (req.query.date) {
        if (req.query.date.startsWith("gte:")) {
            const date = new Date(parseInt(req.query.date.replace("gte:", "")));
            query.date = { $gte: date };
        } else {
       
        query.date = req.query.date;
      }
    }

    if (req.query.dateFrom) {
      const date = new Date(parseInt(req.query.dateFrom));
      query.date = { ...query.date, $gte: date };
    }
    if (req.query.dateTo) {
      const date = new Date(parseInt(req.query.dateTo));
      query.date = { ...query.date, $lte: date };
    }
    
    const data = await ActivityObject.find({ ...query, organisation: req.user.organisation }).sort("-created_at");
    return res.status(200).send({ ok: true, data });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.post("/", passport.authenticate("user", { session: false }), async (req, res) => {
  try {
    const body = req.body;
    await ProjectObject.findOneAndUpdate({ _id: body.projectId }, { last_updated_at: new Date() }, { new: true });
    const query = { projectId: body.projectId, userId: body.userId, date: body.date };
    const activities = await ActivityObject.findOneAndUpdate(query, { ...body, organisation: req.user.organisation }, { new: true, upsert: true });

    res.status(200).send({ ok: true, data: activities });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

router.delete("/:id", passport.authenticate("user", { session: false }), async (req, res) => {
  try {
    await ActivityObject.findByIdAndDelete(req.params.id);
    res.status(200).send({ ok: true, data: null });
  } catch (error) {
    console.log(error);
    res.status(500).send({ ok: false, code: SERVER_ERROR, error });
  }
});

module.exports = router;
