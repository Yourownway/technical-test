const mongoose = require("mongoose");

const MODELNAME = "activity";

const Schema = new mongoose.Schema({
  projectId: { type: String },
  userId: { type: String },
  userAvatar: { type: String, default: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y" },
  userCostPerDay: { type: Number },
  userSellPerDay: { type: Number },
  userJobTitle: { type: String },
  date: { type: Date },
  total: { type: Number, default: 0 },
  cost: { type: Number, default: 0 },
  value: { type: Number, default: 0 },
  detail: [{ date: Date, value: Number ,userAction : [{userId:String, value: Number, priceSpend: Number }]}],
  created_at: { type: Date, default: Date.now },
  comment: { type: String },
  organisation: { type: String, trim: true, unique: true },
});

Schema.post("aggregate", function (doc) {
  if (doc.length > 1) {
    const avgOnAllProjects = doc.reduce((total, current, index) => {
      return (total = current.formatStats.reduce(
        (total2, current2, index2) => {
          for (let i = 0; i < doc.length; i++) {
            if (current2) {
              if (typeof total[index2] !== "object") {
                total[index2] = { value: current2.value, priceSpend: current2.priceSpend, userId: current2.userId };
              } else {
                total[index2].value += doc[i].formatStats[index2].value;
                total[index2].priceSpend += doc[i].formatStats[index2].priceSpend;
              }
            }
            return total;
          }
        },
        [{}]
      ));
    }, []);
    doc.splice(1, doc.length - 1);
    doc[0].formatStats = avgOnAllProjects;
  }
  return doc;
});

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
