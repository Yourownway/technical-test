import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useSelector } from "react-redux";
import SelectMonth from "./../../components/selectMonth";
import SelectProject from "../../components/selectProject";
import { getDaysInMonth } from "../activity/utils";
import moment from "moment";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Analyze() {
  const [dataStats, setDataStats] = useState(null);
  const [statFilter, setStatFilter] = useState("users");
  const [project, setProject] = useState("");
  const [timeDimension, setTimeDimension] = useState("mounth");
  const [days, setDays] = useState(null);

  const [date, setDate] = useState(null);

  const options = ["users", "objective"];
  const handleStatFilter = (value) => {
    setStatFilter(value);
  };
  const timeDimOptions = ["week", "mounth", "years"];
  const handleTimeDimension = (e) => {
    setTimeDimension(e);
  };

  const u = useSelector((state) => {
    return state.Auth.user;
  });

  useEffect(() => {
    if (!date) return;
    const from = new Date(date);
    setDays(getDaysInMonth(from.getMonth(), from.getFullYear()));
  }, [date]);

  useEffect(() => {
    if (!date || !statFilter) return;
    (async () => {
      const { data } = await api.get(
        `/activity/stats?date=${date.getTime()}&organisation=${u.organisation}&filter=${statFilter}&projectId=${project._id}&projectName=${project.name}`,
      );
      setDataStats(data);
    })();
  }, [date, statFilter, project]);
  return (
    <div className="w-screen md:w-full">
      <div className="flex flex-wrap gap-5 p-2 md:!px-8">
        <SelectOption onChange={handleStatFilter} value={statFilter} options={options} />
        <SelectMonth start={-3} indexDefaultValue={3} value={date} onChange={(e) => setDate(new Date(e.target.value))} showArrows />
        <SelectOption onChange={handleTimeDimension} value={timeDimension} options={timeDimOptions} />
        <SelectProject
          value={project.name}
          onChange={(e) => {
            if (e) {
              setProject({ name: e.name, id: e._id });
            } else {
              setProject({ name: "allProject", id: null });
            }
          }}
          className="w-[180px] bg-[#FFFFFF] text-[#212325] py-[10px] px-[14px] rounded-[10px] border-r-[16px] border-[transparent] cursor-pointer shadow-sm font-normal text-[14px]"
        />
      </div>
      {!dataStats && <div>Loader</div>}
      {dataStats && statFilter === "users" && <UserStats days={days} dataStats={dataStats} />}
      {dataStats && statFilter === "objective" && <ObjectiveStats />}
    </div>
  );
}

function SelectOption({ onChange, value, options }) {
  return (
    <select
      className="w-[180px] bg-[#FFFFFF] text-[12px] text-[#212325] font-semibold py-[4px] px-[4px] rounded-[5px] border-r-[16px] border-[transparent] cursor-pointer shadow-sm"
      name="project"
      value={value || ""}
      onChange={(e) => {
        e.preventDefault();

        onChange(e.target.value);
      }}>
      {options.map((e, i) => {
        return (
          <option key={`option-${i + 1}`} value={e}>
            {e}
          </option>
        );
      })}
    </select>
  );
}

const UserStats = ({ days, dataStats }) => {
  const [users, setUsers] = useState(null);
  const [userDimension, setUserDimension] = useState("All user");
  const [dataUserSet, setDataUserSet] = useState([]);
  console.log("🚀 ~ file: index.js:100 ~ UserStats ~ users", dataUserSet);
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Users",
      },
    },
  };

  let initialValue = [];
  useEffect(() => {
    (async () => {
      const { data } = await api.get("/user");
      setUsers(data);
      data.forEach((e) => {
        if (e) {
          return initialValue.push([]);
        }
      });
      const formatUserData = dataStats[0].userStats.reduce((total, current, index) => {
        for (let i = 0; i < initialValue.length; i++) {
          if (current[i]) [(total[i][index] = current[i])];
          else {
            total[i][index] = [];
          }
        }
        return total;
      }, initialValue);
      setDataUserSet(formatUserData);
    })();
  }, []);

  useEffect(() => {
    if (initialValue.length === 0) return;
  }, [initialValue]);

  const displayDay = days.map((e) => {
    const dateMomentObject = moment(e).format("dd, DD-MM-YYYY");
    return `${dateMomentObject}`;
  });

  const dataStatsMap = dataStats[0].userStats.map((e) => {
    if (!e) return;
    if (e[0]?.priceSpend) return e[0].priceSpend;
  });

//   let dataset = []
// useEffect(() => {
//     if(dataUserSet.length === 0 ) return
//     const datasets = dataUserSet.map((e,i)=>{return{label:users[i].name,data: e[i].priceSpend }})
// }, [dataUserSet])



  if (!dataStats) return <></>;
  const data = {
    labels: displayDay,
    datasets: [
      {
        label: "User 1 priceSpend / day",
        data: dataStatsMap,
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      //   {
      //     label: "Dataset 2",
      //     data: labels.map(() => faker.datatype.number({ min: 0, max: 1000 })),
      //     backgroundColor: "rgba(53, 162, 235, 0.5)",
      //   },
    ],
  };

  return (
    <div>
      {users && (
        <SelectOption
          onChange={(e) => {
            setUserDimension(e);
          }}
          options={users.map((e) => e.name)}
          value={userDimension}
        />
      )}
      <Bar options={options} data={data} />
    </div>
  );
};

const ObjectiveStats = () => {
  return <></>;
};
