import React, { useEffect, useState, useCallback, useRef } from "react";
import Webcam from "react-webcam";
import { useRouter } from 'next/router';
import { Grid , Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

const primaryColor = "#162a53"
const secondaryColor = "#f79d35"
const tertiaryColor = "#fdfbfc"


const FullScreenContainer = styled('div')({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100vw',
  height: '100vh',
  overflow: 'hidden',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
});

const ButtonBar = styled(Grid)(({ cameraOpen }) => ({
  position: 'absolute',
  width: '100%',
  zIndex: 1000,
  justifyContent: 'center',
  alignItems: 'center',
  bottom: cameraOpen ? '1%' : '45%',
  transition: 'bottom 0.7s ease-in-out 1.5s',
}));

const WebcamContainer = styled(Grid)({
    position: 'absolute',
    width: '100vw',
    height: '100vh',
    opacity: 0,
    animation: 'fadeIn 1s ease-in-out 1s forwards', // Added 1s delay
    '@keyframes fadeIn': {
        to: {
            opacity: 1
        }
    }
});

const StyledWebcam = styled(Webcam)({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const FrozenImageWrapper = styled(Grid)({
    position: 'absolute',
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    animation: 'resizeImage 0.7s ease-in-out forwards, pushUp 0.7s ease-in-out forwards, fadeShadow 0.7s ease-in-out forwards',
    '@keyframes resizeImage': {
        to: {
            width: '90vw',
            height: '85vh',
            borderRadius: 8,
        }
    },
    '@keyframes pushUp': {
        to: {
            top: '4%',
        }
    },
    '@keyframes fadeShadow': {
        from: {
            boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px'
        },
        to: {
            boxShadow: 'rgba(255, 255, 255, 0.34) 0px 7px 29px 0px'
        }
    }
});

const FrozenImage = styled('img')({
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 8,
    transition: 'border-radius 0.7s ease-in-out',
});

const CustomButton = styled(Button)({
  margin: 5,
  height: "50px",
  width: "200px",
  transition: 'all 0.3s ease-in-out',
});

const LoadingContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100vw',
  height: '100vh',
});

const videoConstraints = {
  width: { ideal: 1920 },
  height: { ideal: 1080 },
  facingMode: "environment"
};

const Upload = () => {

    const router = useRouter();
    const [employeeId, setEmployeeId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cameraOpen, setCameraOpen] = useState(false);
    const [frozenImage, setFrozenImage] = useState(null);
    const webcamRef = useRef(null);

    useEffect(() => {
        if (!router.isReady) return;
        const { employee_id } = router.query;

        if (employee_id) {
        setEmployeeId(employee_id);
        console.log("Employee ID captured:", employee_id);
        } else {
        console.log("No employee_id found in URL");
        }

        setLoading(false);
    }, [router.isReady, router.query]);

    const capture = useCallback(() => {
        if (webcamRef.current) {
        const screenshot = webcamRef.current.getScreenshot();
        if (screenshot) {
            setFrozenImage(screenshot);
            console.log("Image captured and frozen");
        }
        }
    }, []);

    const toggleCamera = () => {
        if (frozenImage) {
        setFrozenImage(null); // unfreeze
        } else {
        setCameraOpen(prev => {
            const newState = !prev;
            if (!newState) setFrozenImage(null);
            return newState;
        });
        }
    };

    const handleUpload = () => {
        console.log("Uploading image:", frozenImage);
        // Your upload logic here
    };

    if (loading) {
        return (
        <LoadingContainer>
            <CircularProgress size={60} />
        </LoadingContainer>
        );
    }

  return (
    <Grid item container xs={12} sx={{ height: "100vh", width: "100vw" , backgroundColor: primaryColor}}>
        <Grid
        container
        sx={{ 
            height: cameraOpen ? "100%" : "60%",
            width: "100%",
            backgroundColor: primaryColor,
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            transition: "height 0.5s ease-in-out",
            position: "relative",
        }}
        >
            <Grid sx={{opacity: cameraOpen ? 0 : 1, transition: "opacity 0.7s ease-in-out"}}>
                <Grid 
                    item
                    container 
                    justifyContent="center" 
                    alignItems="center" 
                    sx={{ 
                    height: "35%", 
                    width: "100%",
                    my: 8
                    }}
                >
                    <img 
                    src="https://img.icons8.com/?size=200&id=23103&format=png&color=000000" 
                    alt="Icon" 
                    style={{ maxWidth: "100%", maxHeight: "100%" }} 
                    />
                </Grid>
                <Grid 
                    item 
                    container 
                    sx={{
                    width: "100%", 
                    justifyContent: "center",
                    mb: 1
                    }}
                >
                    <Typography 
                    variant="body1" 
                    sx={{ 
                        fontSize: 18, 
                        color: tertiaryColor,
                        fontFamily: 'Roboto, sans-serif',
                        fontWeight: 300
                    }}
                    >
                    You need to upload your
                    </Typography>
                </Grid>
                <Grid 
                    item 
                    container 
                    sx={{
                    width: "100%", 
                    justifyContent: "center"
                    }}
                >
                    <Typography 
                    variant="h4" 
                    sx={{ 
                        fontSize: 32, 
                        color: tertiaryColor,
                        fontFamily: 'Roboto, sans-serif',
                        fontWeight: 500
                    }}
                    >
                    Receipt or Invoice
                    </Typography>
                </Grid>     
                <Grid 
                    item 
                    container 
                    sx={{
                    width: "100%", 
                    justifyContent: "center",
                    px: 4,
                    py: 2,
                    opacity: 0.7
                    }}
                >
                    <Typography 
                    variant="h4" 
                    sx={{ 
                        fontSize: 15, 
                        color: tertiaryColor,
                        fontFamily: 'Roboto, sans-serif',
                        fontWeight: 200,
                        textAlign: "center",
                    }}
                    >
                    After uploading your receipt you will receive a mail confirming your reimbursement details, hold tight as the process may take a few seconds.
                    </Typography>
                </Grid> 
            </Grid>
            {cameraOpen ? <WebcamContainer>
                <StyledWebcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                />
            </WebcamContainer> : <></>}
        </Grid>
        <Grid container 
        sx={{ 
            xs: 12, 
            height: cameraOpen ? "0%" : "40%",
            width: "100%",
            backgroundColor: tertiaryColor,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            zIndex: 20,
            position: "relative",
            transition: "height 0.5s ease-in-out",
        }}
        >
            <Button
            variant="contained"
            onClick={cameraOpen ? capture : toggleCamera}
            sx={{
                position: "absolute",
                height: cameraOpen ? "65px" : "50px",
                width: cameraOpen ? "50px" : "250px",
                top: cameraOpen? -50 : 0,
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: cameraOpen ? "red" : secondaryColor,
                '&:hover': {
                    backgroundColor: cameraOpen ? "red" : secondaryColor,
                },
                borderRadius: 8,
                fontSize: 16,
                transition: "all 0.7s ease-in-out",
                border: cameraOpen ? "3px solid #fff" : "none",
            }}
            >
            <p 
            style={{
                opacity: cameraOpen ? 0 : 1, 
                transition: "opacity 0.2s ease-in-out 0.7s",
            }}>{cameraOpen ? "" : "Open Camera"}</p>
            </Button>
        </Grid>
      {/* {cameraOpen && (
        frozenImage ? (
          <FrozenImageWrapper>
            <FrozenImage src={frozenImage} alt="Captured" />
          </FrozenImageWrapper>
        ) : (
          <WebcamContainer>
            <StyledWebcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
            />
          </WebcamContainer>
        )
      )}
      <ButtonBar container cameraOpen={cameraOpen}>
        <CustomButton 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={toggleCamera}
          startIcon={<CameraAltIcon />}
        >
          {frozenImage ? 'Retake' : (cameraOpen ? 'Close Camera' : 'Open Camera')}
        </CustomButton>
        <CustomButton 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={cameraOpen ? (frozenImage ? handleUpload : capture) : undefined}
          startIcon={<CameraAltIcon />}
        >
          {frozenImage ? 'Upload Image' : (cameraOpen ? 'Capture Image' : 'Select Image')}
        </CustomButton>
      </ButtonBar> */}
    </Grid>
  );
};

export default Upload;
