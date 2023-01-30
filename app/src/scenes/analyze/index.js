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
  const [userDimension, setUserDimension] = useState(null);

  const [project, setProject] = useState("");
  const [days, setDays] = useState(null);

  const [date, setDate] = useState(null);

  const options = ["users", "objective"];
  const handleStatFilter = (value) => {
    setStatFilter(value);
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
    if (!date || !statFilter || !u) return;
    (async () => {
      const { data } = await api.get(
        `/analyze/?date=${date.getTime()}&organisation=${u.organisation}&filter=${statFilter}&userId=${userDimension ? userDimension._id : u._id}&projectId=${
          project._id && project._id
        }&projectName=${project.name}`,
      );
      setDataStats(data);
    })();
  }, [date, statFilter, project, userDimension]);
  return (
    <div className="w-screen md:w-full">
      <div className="flex flex-wrap gap-5 p-2 md:!px-8">
        <SelectOption onChange={handleStatFilter} value={statFilter} options={options} />
        <SelectMonth start={-3} indexDefaultValue={3} value={date} onChange={(e) => setDate(new Date(e.target.value))} showArrows />
        {/* <SelectOption onChange={handleTimeDimension} value={timeDimension} options={timeDimOptions} /> */}
        <SelectProject
          value={project.name}
          onChange={(e) => {
            if (e) {
              setProject(e);
            } else {
              setProject({ name: "allProject", id: undefined });
            }
          }}
          className="w-[180px] bg-[#FFFFFF] text-[#212325] py-[10px] px-[14px] rounded-[10px] border-r-[16px] border-[transparent] cursor-pointer shadow-sm font-normal text-[14px]"
        />
      </div>
      {!dataStats && <div>Loader</div>}
      {project && project._id && <ProjectStats project={project} />}
      {dataStats && statFilter === "users" && (
        <UserStats days={days} dataStats={dataStats} userDimension={userDimension} setUserDimension={setUserDimension} projectId={project._id} />
      )}
      {dataStats && statFilter === "objective" && <ObjectiveStats />}
    </div>
  );
}

function SelectOption({ onChange, value, options, name = "project" }) {
  const type = typeof value;
  return (
    <>
      {type === "object" ? (
        <select
          className="w-[180px] bg-[#FFFFFF] text-[12px] text-[#212325] font-semibold py-[4px] px-[4px] rounded-[5px] border-r-[16px] border-[transparent] cursor-pointer shadow-sm"
          name={name}
          onChange={(e) => {
            e.preventDefault();
            onChange(JSON.parse(e.target.value));
          }}>
          {options.map((e, i) => {
            return (
              <option key={`option-${i + 1}`} value={JSON.stringify(e)}>
                {e.name}
              </option>
            );
          })}
        </select>
      ) : (
        <select
          className="w-[180px] bg-[#FFFFFF] text-[12px] text-[#212325] font-semibold py-[4px] px-[4px] rounded-[5px] border-r-[16px] border-[transparent] cursor-pointer shadow-sm"
          name={name}
          value={value}
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
      )}
    </>
  );
}

const ProjectStats = ({ project }) => {
  if (!project) return <></>;
  return (
    <>
      <div>Budget max monthly: {project.budget_max_monthly}</div>
      <div>benefit_monthly: {project.benefit_monthly}</div>
    </>
  );
};

const UserStats = ({ days, dataStats, userDimension, setUserDimension, projectId }) => {
  const [users, setUsers] = useState(null);
  const [config, setConfig] = useState(null);

  let initialValue = [];

  useEffect(() => {
    (async () => {
      const { data } = await api.get("/user");
      if (data) {
        const array = data.map((e) => {
          const { _id, name, sellPerDay, costPerDay, days_worked } = e;
          return { _id, name, sellPerDay, costPerDay, days_worked };
        });
        setUsers(array);
        setUserDimension(array[0]);
      }
      //   data.forEach((e) => {
      //     if (e) {
      //       return initialValue.push([]);
      //     }
      //   }
      //   );
      // const formatUserData = dataStats[0].userStats.reduce((total, current, index) => {
      //   for (let i = 0; i < initialValue.length; i++) {
      //     if (current[i]) [(total[i][index] = current[i])];
      //     else {
      //       total[i][index] = [];
      //     }
      //   }
      //   return total;
      // }, initialValue);
    })();
  }, []);

  useEffect(() => {
    if (initialValue.length === 0) return;
  }, [initialValue]);

  useEffect(() => {
//  if (!days || !userDimension || !dataStats[0]?.userStats) return setConfig(null);
    const displayDay = days.map((e) => {
      const dateMomentObject = moment(e).format("dd, DD-MM-YYYY");
      return `${dateMomentObject}`;
    });

    const dataSetPrice = dataStats[0]?.formatStats?.map((e) => (e?.priceSpend ? e.priceSpend : 0)) || [];
    const dataSetValue = dataStats[0]?.formatStats?.map((e) => (e?.value ? e.value : 0)) || [];

    const cfg = {
      labels: displayDay,
      datasets: [
        { label: `price spend per day`, data: dataSetPrice || [], backgroundColor: "rgba(255,0, 0, 0.6)", borderWidth: 1 },
        { label: `value`, data: dataSetValue || [], backgroundColor: "rgba(0, 0, 255, 0.6)", borderWidth: 1 },
      ],
    };
    setConfig(cfg);
  }, [userDimension, projectId, dataStats]);

  if (!userDimension) return <></>;
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `Users: ${userDimension.name}`,
      },
    },
  };
  return (
    <div>
      {users && (
        <SelectOption
          onChange={(e) => {
            setUserDimension(e);
          }}
          options={users}
          value={userDimension}
        />
      )}
      <div className="relative flex items-start justify-center pt-6 pb-2 gap-5">
      <div>days_worked : {userDimension.days_worked}</div>
      <div>Sell Per Day : {userDimension.sellPerDay}</div>
      <div>cost Per Day : {userDimension.costPerDay}</div>
      </div>
      <div>
      {config ? <Bar options={options} data={config} /> : <div>no data found</div>}
      </div>
    </div>
  );
};

const ObjectiveStats = () => {
  return <></>;
};
