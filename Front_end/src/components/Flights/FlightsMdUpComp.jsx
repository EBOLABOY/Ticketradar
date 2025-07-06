import { Typography } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import React from "react";
import dayjs from "dayjs";
import { ListItemComp } from "./FlyListItemComp";
import { formatBackendPrice } from "../../utils/priceFormatter";
import { localizeStops, getShortAirportName } from "../../utils/flightLocalizer";

const FlightsMdUpComp = ({ item, formatDuration }) => {
  return (
    <Grid2
      container
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Grid2 item="true" size={{ xs: 4, md: 4 }}>
        <ListItemComp
          imgLink={item.legs[0]?.airline?.logoUrl || ''}
          img={true}
          primary={`${dayjs(item.legs[0]?.departure_datetime || item.legs[0]?.departure).format("h:mm A")} - ${dayjs(
            item.legs[0]?.arrival_datetime || item.legs[0]?.arrival
          ).format("h:mm A")}`}
          secondary={item.legs[0]?.airline?.name || '未知航空公司'}
        />
      </Grid2>

      <Grid2
        item="true"
        size={{ xs: 6, md: 5 }}
        sx={{
          display: "flex",
          alignItems: "center",
          whiteSpace: "nowrap",
          gap: 2,
          justifyContent: "space-between",
        }}
      >
        <Grid2
          container
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Grid2
            item="true"
            size={{ xs: 4 }}
            sx={{ justifyContent: "flex-start" }}
          >
            <ListItemComp
              img={false}
              primary={formatDuration(item.legs[0]?.duration || item.legs[0]?.durationInMinutes)}
              secondary={`${getShortAirportName(item.legs[0]?.departure_airport?.code || item.legs[0]?.origin)} - ${getShortAirportName(item.legs[0]?.arrival_airport?.code || item.legs[0]?.destination)}`}
            />
          </Grid2>
          <Grid2
            item="true"
            size={{ xs: 5 }}
            sx={{ justifyContent: "center", display: "flex" }}
          >
            <Typography>
              {localizeStops(item.stops)}
            </Typography>
          </Grid2>
          <Grid2
            item="true"
            size={{ xs: 3 }}
            sx={{ justifyContent: "flex-end", display: "flex" }}
          >
            <ListItemComp
              img={false}
              primary="56kg CO2e"
              secondary="Avg emissions"
              sx={{ textAlign: "right" }}
            />
          </Grid2>
        </Grid2>
      </Grid2>

      <Grid2 item="true" size={{ xs: 2, md: 3 }} sx={{ textAlign: "right" }}>
        <Typography>{formatBackendPrice(item.price).formatted}</Typography>
      </Grid2>
    </Grid2>
  );
};

export default FlightsMdUpComp;
