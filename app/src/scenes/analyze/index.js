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
  const [statFilter, setStatFilter] = useState("users");
  const [dataStats, setDataStats] = useState(null);
  const [dataProjects, setDataProjects] = useState(null);
  console.log("🚀 ~ file: index.js:17 ~ Analyze ~ dataProjects", dataProjects);

  const [userDimension, setUserDimension] = useState(null);

  const [project, setProject] = useState({ name: "allProject", id: undefined });
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
        <SelectProject
          value={project.name}
          onChange={(e) => {
            if (e) {
              setProject(e);
            } else {
              setProject({ name: "allProject", id: undefined });
            }
          }}
          handleProjects={(projects) => setDataProjects(projects)}
          className="w-[180px] bg-[#FFFFFF] text-[#212325] py-[10px] px-[14px] rounded-[10px] border-r-[16px] border-[transparent] cursor-pointer shadow-sm font-normal text-[14px]"
        />
      </div>
      {!dataStats && <div>Loader</div>}
      <ProjectStats project={project} projects={dataProjects} />
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

const ProjectStats = ({ project, projects }) => {
  if (!projects) return <></>;
  const totalProjects = projects.reduce((total, current) => {
    if (!total?.budget_max_monthly) {
      total.budget_max_monthly = current?.budget_max_monthly || 0;
      total.benefit_monthly = current?.benefit_monthly || 0;
    } else {
      total.budget_max_monthly += current?.budget_max_monthly || 0;
      total.benefit_monthly += current?.benefit_monthly || 0;
    }
    return total;
  }, {});

  return (
    <div className="relative flex items-start justify-center pt-6 pb-2 gap-5">
      {project._id ? (
        <>
          <div>Name: {project.name}</div>
          <div>Budget max monthly: {project.budget_max_monthly}</div>
          <div>Benefit_monthly: {project.benefit_monthly}</div>
        </>
      ) : (
        <>
          <div>Name: All projects</div>
          <div>Budget max monthly: {totalProjects.budget_max_monthly}</div>
          <div>Benefit_monthly: {totalProjects.benefit_monthly}</div>
        </>
      )}
    </div>
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
        <div className="flex flex-wrap gap-5 p-2 md:!px-8">
          <SelectOption
            onChange={(e) => {
              setUserDimension(e);
            }}
            options={users}
            value={userDimension}
          />
        </div>
      )}
      <div className="relative flex items-start justify-center pt-6 pb-2 gap-5">
        <div>Days_worked : {userDimension.days_worked}</div>
        <div>Sell Per Day : {userDimension.sellPerDay}</div>
        <div>Cost Per Day : {userDimension.costPerDay}</div>
      </div>
      <div className="flex w-3/5 flex-wrap gap-5 p-2 md:!px-8">{config ? <Bar options={options} data={config} /> : <div>no data found</div>}</div>
    </div>
  );
};

const ObjectiveStats = () => {
  return <></>;
};
