import { useState, useEffect } from 'react';
import { Grid , Typography } from '@mui/material';
import fetchAllFiles from './api/dashboard';

const primaryColor = "#162a53"
const secondaryColor = "#f79d35"
const tertiaryColor = "#fdfbfc"


export default function List() {
  const [allFiles, setAllFiles] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch list items on component mount
  useEffect(() => {
        fetchAllFiles()
          .then((response) => {
            if (response.ok) {
              setAllFiles(response);
              console.log(response)
            }
            return response.text();
          })
          .then((result) => console.log(result))
          .catch((error) => {
            console.error(error);
          });
  }, []);


  return (
    <Grid item container xs={12} sx={{ height: "100svh", width: "100vw" , backgroundColor: primaryColor, position: "relative"}}>
    </Grid>
  );
}