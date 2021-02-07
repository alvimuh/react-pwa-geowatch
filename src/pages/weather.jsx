import { useEffect, useState } from "react";
import axios from "axios";
import { parseString } from "xml2js";

export default function Weather() {
  const [data, setData] = useState(null);
  useEffect(() => {
    axios
      .get(
        "https://data.bmkg.go.id/datamkg/MEWS/DigitalForecast/DigitalForecast-JawaBarat.xml"
      )
      .then((res) => {
        parseString(res.data, (err, result) => {
          const data = formatDataBmkg(result);
          setData(data);
        });
      });
  }, []);
  return (
    // <nav className="weather-nav">
    //   <ul>
    //     {data && data.map((item, index) => <li key={index}>{item.kota}</li>)}
    //   </ul>
    // </nav>
    <section>
      {data ? (
        <div className="weather-wrap">
          <h1>{data[21].kota}</h1>
          <p>{data[21].provinsi}</p>
          <div className="parameter-wrap">
            {data[21].parameter.map((item, index) => (
              <div className="parameter-item" key={index}>
                <small>{item.date}</small>
                <p>{getCuaca(item.weather_day)}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p style={{ padding: "50px" }}>"Loading..."</p>
      )}
    </section>
  );
}
function getCuaca(code) {
  switch (parseInt(code)) {
    case 0 || 100:
      return "Cerah / Clear Skies";
    case 1 || 101:
      return "Cerah Berawan / Partly Cloudy";
    case 2 || 102:
      return "Cerah Berawan / Partly Cloudy";
    case 3 || 103:
      return "Berawan / Mostly Cloudy";
    case 4 || 104:
      return "Berawan Tebal / Overcast";
    case 5:
      return "Udara Kabur / Haze";
    case 10:
      return "Asap / Smoke";
    case 45:
      return "Kabut / Fog";
    case 60:
      return "Hujan Ringan / Light Rain";
    case 61:
      return "Hujan Sedang / Rain";
    case 63:
      return "Hujan Lebat / Heavy Rain";
    case 80:
      return "Hujan Lokal / Isolated Shower";
    case 95:
      return "Hujan Petir / Severe Thunderstorm";
    case 97:
      return "Hujan Petir / Severe Thunderstorm";
    default:
      return "Tidak ada";
  }
}
function formatDataBmkg(json) {
  const data = json.data.forecast[0].area
    // filter duplicate data
    .filter((element, index, inputArray) => {
      return inputArray.indexOf(element) === index;
    })
    // filter empty array
    .filter((element) => {
      return element.parameter != null;
    })
    // map output of the data
    .map((area) => {
      // get the minimal temperature value
      const temp_min = area.parameter
        .filter((params) => {
          return params.$.id === "tmin";
        })
        .map((params) => {
          return params.timerange.map((timerange) => {
            const dateTime = timerange.$.day;
            return {
              date: dateTime,
              value: timerange.value[0]._,
            };
          });
        });

      // get the maximum temperature value
      const temp_max = area.parameter
        .filter((params) => {
          return params.$.id === "tmax";
        })
        .map((params) => {
          return params.timerange.map((timerange) => {
            const dateTime = timerange.$.day;
            return {
              date: dateTime,
              value: timerange.value[0]._,
            };
          });
        });

      // get the weather
      const weather = area.parameter
        .filter((params) => {
          return params.$.id === "weather";
        })
        // take the value of weahter by hour in three days
        .map((params) => {
          const weahter = params.timerange
            .filter((timerange) => {
              return (
                timerange.$.h === "6" ||
                timerange.$.h === "18" ||
                timerange.$.h === "30" ||
                timerange.$.h === "42" ||
                timerange.$.h === "54" ||
                timerange.$.h === "66"
              );
            })
            .map((timerange) => {
              const codeCuaca = timerange.value[0]._;
              const dateTime = timerange.$.datetime;
              return {
                date: dateTime,
                value: codeCuaca,
              };
            });
          return weahter;
        })
        // simplify the output
        .map((val) => {
          return [
            {
              date: val[0].date,
              siang: val[0].value,
              malam: val[1].value,
            },
            {
              date: val[2].date,
              siang: val[2].value,
              malam: val[3].value,
            },
            {
              date: val[4].date,
              siang: val[4].value,
              malam: val[5].value,
            },
          ];
        });

      // simplify again to reduce the file size
      const format = {
        provinsi: area.$.domain,
        kota: area.name[1]._,
        parameter: [
          {
            date: temp_min[0][0].date,
            temp_min: temp_min[0][0].value,
            temp_max: temp_max[0][0].value,
            weather_day: weather[0][0].siang,
            weather_night: weather[0][0].malam,
          },
          {
            date: temp_min[0][1].date,
            temp_min: temp_min[0][1].value,
            temp_max: temp_max[0][1].value,
            weather_day: weather[0][1].siang,
            weather_night: weather[0][1].malam,
          },
          {
            date: temp_min[0][2].date,
            temp_min: temp_min[0][2].value,
            temp_max: temp_max[0][2].value,
            weather_day: weather[0][2].siang,
            weather_night: weather[0][2].malam,
          },
        ],
      };
      return format;
    });

  return data;
}
