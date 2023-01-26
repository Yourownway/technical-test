import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useSelector } from "react-redux";
import SelectMonth from "./../../components/selectMonth";
import SelectProject from "../../components/selectProject";
export default function Analyze() {
  const [dataStats, setDataStats] = useState(null);
  const [statFilter, setStatFilter] = useState("users");
  const [project, setProject] = useState("");
  const [timeDimension, setTimeDimension] = useState("mounth");


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
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const date = params.get("date");
    if (date) setDate(new Date(date));
  }, []);

  useEffect(() => {
    if (!date || !statFilter) return;
    (async () => {
      const { data } = await api.get(`/activity/stats?date=${date.getTime()}&organisation=${u.organisation}&filter=${statFilter}&project${project._id}&project${project.name}`);
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
            if (e._id) {
              setProject({ name: e.name, id: e._id });
            } else {
              setProject({ name: e.name, id: "none" });
            }
          }}
          className="w-[180px] bg-[#FFFFFF] text-[#212325] py-[10px] px-[14px] rounded-[10px] border-r-[16px] border-[transparent] cursor-pointer shadow-sm font-normal text-[14px]"
        />
      </div>
      {!dataStats && <div>Loader</div>}
      {dataStats && statFilter === "users" && <UserStats />}
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

const UserStats = () => {
  return <></>;
};

const ObjectiveStats = () => {
  return <></>;
};
