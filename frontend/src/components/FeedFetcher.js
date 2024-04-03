import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactJson from "react-json-view";
import TrafficEventTable from "./TrafficEventTable";

import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import {
  Breadcrumbs,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Link,
  List,
  MenuItem,
  Select,
  TextField,
  Typography,
  ListItemButton,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Stack,
} from "@mui/material";
import { Icons, toast } from "react-toastify";
import logo from "../logo.svg";
import TempTable from "./TempTable";
import MuiTable from "./MuiTable";
import {
  GridCheckCircleIcon,
  GridCheckIcon,
  GridCloseIcon,
} from "@mui/x-data-grid";
import emotionStyled from "@emotion/styled";

const backendUrl = "https://feedfetcher.duckdns.org";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

const FeedContainer = emotionStyled.div`
  position: relative;
  width: 100%;
  .list-autocomplete {
    border: 1px solid grey;
    border-radius: 5px;
    position: absolute;
    width: 100%;
    background: white;
    z-index: 100;
  }
  .invisible {
    display: none;
  }
`;

const FeedFetcher = () => {
  const [pastData, setPastData] = useState([]);
  const [pastFiltered, setPastFiltered] = useState([]);
  const [newdata, setNew] = useState([]);
  const [url, setUrl] = useState("");
  const [isloading, setIsLoading] = useState(false);
  const [feedData, setFeedData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [showUrlHistory, setShowUrlHistory] = useState(false);
  const [hideLeft, setHideLeft] = useState(false);
  const [hideRight, setHideRight] = useState(false);

  const [record, setRecord] = useState([]);
  const [id, setID] = useState("");
  const [idlist, setIDlist] = useState("");
  const getHistoryURLs = () => {
    const urlsJSON = localStorage.getItem("urls");
    let urls = [];
    if (urlsJSON) {
      urls = JSON.parse(urlsJSON);
    }
    return urls;
  };
  const urlHistory = getHistoryURLs();

  const sendUrlToServer = async () => {
    if (url.length === 0) {
      toast.success("Hi");
      alert("You should enter URL");
      return;
    }
    setIsLoading(true);
    try {
      // axios.disable("etag");
      const response = await axios.post(`${backendUrl}/api/data`, {
        url: url,
      });
      setIDlist(Object.keys(response.data.newData[0]));
      setFiltered(response.data.newData);
      setFeedData(response.data.newData);
      setPastData(response.data.pastData);
      const urlsJSON = localStorage.getItem("urls");
      let urls = [];
      if (urlsJSON) {
        urls = JSON.parse(urlsJSON);
      }
      if (!urls.includes(url)) {
        localStorage.setItem("urls", JSON.stringify([...urls, url]));
      }
      setID(response.data.identifier);
      setRecord(response.data.record);
      setIsLoading(false);
    } catch (error) {
      console.log("error: ", error);
      alert("Invalid URL or Internal Server Error");
      // console.error("Error fetching feed:", error);
      setIsLoading(false);
      setFeedData();
    }
  };
  useEffect(() => {
    let _filteredData = [];
    let _pastFiltered = [];
    if (record.length == 0) {
      setPastFiltered(pastData);
      setFiltered(feedData);
      return;
    }
    record.map((_record) => {
      _filteredData.push(feedData[Number(_record)]);
      _pastFiltered.push(pastData[Number(_record)]);
    });
    setPastFiltered(_pastFiltered);
    setFiltered(_filteredData);
  }, [record]);
  return (
    <Box bgcolor="#fff">
      <Box sx={{ flexGrow: 1 }} style={{ padding: "30px" }}>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!hideLeft}
                    onChange={() => setHideLeft(!hideLeft)}
                  />
                }
                label="Show Left Bar"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!hideRight}
                    onChange={() => setHideRight(!hideRight)}
                  />
                }
                label="Show Right Bar"
              />
            </FormGroup>
          </Grid>
          <Grid item xs={9}>
            <Box
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <FeedContainer>
                <TextField
                  id="outlined-basic"
                  label="FEED"
                  variant="outlined"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  style={{ width: "100%" }}
                  onClick={() => {
                    setShowUrlHistory(!showUrlHistory);
                  }}
                />
                <List
                  component="nav"
                  className={`list-autocomplete ${
                    !showUrlHistory && "invisible"
                  }`}
                >
                  {urlHistory.map((_url, index) => (
                    <ListItemButton
                      onClick={() => {
                        setUrl(_url);
                        setShowUrlHistory(false);
                      }}
                      key={index}
                    >
                      {_url}
                    </ListItemButton>
                  ))}
                </List>
              </FeedContainer>
              <Button variant="contained" onClick={sendUrlToServer}>
                FETCH
              </Button>
            </Box>
          </Grid>
        </Grid>
        <Grid container spacing={2} mt={3}>
          <Grid item xs={3} display={`${hideLeft && "none"}`}>
            <Item>
              <Box m={3}>
                <Stack
                  aria-label="breadcrumb"
                  fontSize="18px"
                  justifyContent="start"
                  textAlign="left"
                  flexDirection="row"
                >
                  Main:
                  {record.map((v) => {
                    return <div> {v},</div>;
                  })}
                </Stack>
                <Button
                  variant="contained"
                  color="primary"
                  style={{ margin: "10px" }}
                  onClick={() => {
                    setID();
                    setNew([]);
                    setRecord([]);
                    // console.log(feedData);
                    if (feedData == null) return;
                  }}
                >
                  Reset
                </Button>
                <FormControl fullWidth size="small">
                  <InputLabel id="demo-simple-select-label">Record</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={id}
                    onChange={(e) => {
                      if (!record.includes(e.target.value))
                        setRecord([...record, e.target.value]);
                      setID(e.target.value);
                    }}
                  >
                    {feedData.length &&
                      feedData.map((_, index) => {
                        return (
                          <MenuItem key={index} value={index}>
                            {index}
                          </MenuItem>
                        );
                      })}
                  </Select>
                </FormControl>
                <FormControl
                  fullWidth
                  size="small"
                  style={{ marginTop: "10px" }}
                >
                  <InputLabel id="demo-simple-select-label">
                    Identifier
                  </InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label="Age"
                    value={id}
                    onChange={(e) => {
                      setID(e.target.value);
                    }}
                  >
                    {idlist &&
                      idlist.map((v, index) => {
                        return (
                          <MenuItem key={index} value={v}>
                            {v}
                          </MenuItem>
                        );
                      })}
                  </Select>
                </FormControl>
              </Box>
              {isloading ? (
                <p>Loading feed data...</p>
              ) : (
                <>
                  <h4>JSON Viewer</h4>
                  {feedData && (
                    <ReactJson
                      src={feedData}
                      theme="harmonic"
                      style={{ textAlign: "left" }}
                      collapsed
                    />
                  )}
                </>
              )}
            </Item>
          </Grid>
          <Grid item xs={6 + 3 * hideLeft + 3 * hideRight}>
            <Item>
              <Box
                display={"flex"}
                justifyContent={"space-between"}
                alignItems={"center"}
                padding={"0px 30px"}
              >
                <h2>Result Table</h2>
                {/* <h4>
                  {pastData.length ? (
                    <Chip
                      icon={<GridCheckCircleIcon />}
                      label="Data Saved"
                      variant="outlined"
                      style={{ marginLeft: "20px" }}
                    />
                  ) : (
                    <Chip
                      icon={<GridCloseIcon />}
                      label="Data not Saved"
                      variant="outlined"
                      style={{ marginLeft: "20px" }}
                    />
                  )}
                </h4> */}
                <Button
                  variant="contained"
                  color="success"
                  onClick={async () => {
                    const res = await axios.post(`${backendUrl}/api/register`, {
                      feed: url,
                      record,
                      identifier: id,
                    });
                    if (res.data.status == 200) {
                      toast.success("Successfully saved");
                    }
                  }}
                >
                  SAVE
                </Button>
              </Box>
              {
                <MuiTable
                  data={filtered}
                  identifier={id}
                  pastData={pastFiltered}
                  setNew={setNew}
                />
              }
            </Item>
          </Grid>
          <Grid item xs={3} display={`${hideRight && "none"}`}>
            <Item>
              {isloading ? (
                <p>Loading feed data...</p>
              ) : (
                <>
                  <h4>New JSON</h4>
                  {newdata.length ? (
                    <ReactJson
                      src={newdata}
                      theme="harmonic"
                      style={{ textAlign: "left" }}
                      collapsed
                    />
                  ) : (
                    <></>
                  )}
                </>
              )}
            </Item>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default FeedFetcher;
