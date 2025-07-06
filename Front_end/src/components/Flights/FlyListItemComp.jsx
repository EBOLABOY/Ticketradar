import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";

export const ListItemComp = ({ img, imgLink, primary, secondary }) => {
  return (
    <List sx={{ width: "100%" }}>
      <ListItem>
        {img === true && (
          <ListItemAvatar>
            <Avatar>
              <img
                src={imgLink}
                alt="Flights"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
            </Avatar>
          </ListItemAvatar>
        )}
        <ListItemText primary={primary} secondary={secondary} />
      </ListItem>
    </List>
  );
};

export const ListItemCompResponsive = ({
  img,
  imgLink,
  primary,
  secondary,
  primary1,
  secondary1,
}) => {
  return (
    <List sx={{ width: "100%" }}>
      <ListItem
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1,
        }}
      >
        {img && (
          <ListItemAvatar>
            <Avatar>
              <img
                src={imgLink}
                alt="Flights"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />
            </Avatar>
          </ListItemAvatar>
        )}
        <ListItemText
          sx={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 100,
          }}
          primary={primary}
          secondary={secondary}
        />
        <ArrowRightAltIcon sx={{ alignSelf: "flex-start", mt: 0.5 }} />
        <ListItemText
          sx={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 100,
          }}
          primary={primary1}
          secondary={secondary1}
        />
      </ListItem>
    </List>
  );
};
