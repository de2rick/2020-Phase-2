import React, { useState, useEffect } from "react";
import { getArray, modifyArray } from '../../api/Api';
import { HubConnectionBuilder, LogLevel, HubConnection } from "@microsoft/signalr";
import Grid from "../Grid/Grid";
import CircularProgress from '../CircularProgress/CircularProgress'

const LatestGrid = () => {
  const [colourArray, setColourArray] = useState<string[][]>([]);
  const [changeArray, setChangeArray] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true)
  const [hubConnection, setHubConnection] = useState<HubConnection>();

  useEffect(() => {
    const createHubConnection = async () => {
      const connection = new HubConnectionBuilder().withUrl(process.env.REACT_APP_API_BASE_URL! + "/hub").configureLogging(LogLevel.Information).build()
      try{
        await connection.start()
        console.log("Successfully connected to signalR hub.")

        // Bind event handlers to connection.
        connection.on("NewUserConnection", () => {
          console.log("new uesr joined the session");
        });

      } catch (error) {
        console.log("Error establishing connection to signalR hub: " + { error });
      }
      setHubConnection(connection);
    }
    createHubConnection();
  }, []);


  useEffect(() => {
    if (colourArray.length > 0 && isLoading) setIsLoading(false)
  }, [isLoading, colourArray])
  
  useEffect(() => {
    async function getArrayAsync() {
      if (colourArray.length === 0 || changeArray) {
        const res = await getArray();
        setColourArray(res);
        setChangeArray(false);
      }
    }

    getArrayAsync();
  }, [colourArray, changeArray]);

  const modifyColour = async (props: { position: { row: number; col: number }; colour: string }) => {
    await modifyArray(props);
    setChangeArray(true);
  };

  return isLoading ? <CircularProgress /> : <Grid colourArray={colourArray} canEdit={true} modifyArray={modifyColour} />
};

export default LatestGrid;
