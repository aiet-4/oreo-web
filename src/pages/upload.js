import React, { useEffect, useState, useCallback, useRef } from "react";
import Webcam from "react-webcam";
import { useRouter } from 'next/router';
import { Grid , Typography, IconButton } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import { styled, keyframes } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import { uploadReceipt } from "./api/upload";

const primaryColor = "#162a53"
const secondaryColor = "#f79d35"
const tertiaryColor = "#fdfbfc"

const floatY = keyframes`
  0%   { transform: translateY(-2%); }
  50%  { transform: translateY(2%); }
  100% { transform: translateY(-2%); }
`;

const FloatingImage = styled('img')(({ uploadSuccess }) => ({
    width: '100px',
    height: '100px',
    animation: `${floatY} 0.2s ease-in-out infinite`,
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
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
    height: '85%',
    borderRadius: "20px"
});

const FrozenImage = styled("img")(({ upload }) => ({
    width: upload ? "0%" : '100%',
    height: upload ? "0%" : '100%',
    objectFit: 'cover',
    borderRadius: "20px",
    boxShadow: 'rgba(255, 255, 255, 0.2) 0px 7px 29px 0px',
    opacity: 0,
    transition: "all 0.3s ease-in-out",
    animation: 'fadeIn 0.5s ease-in-out 0.5s forwards',
    '@keyframes fadeIn': {
        to: {
            opacity: 1
        }
    }
}));

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
    const [pushUpload,setPushUpload] = useState(false)
    const [uploadStatus, setUploadStatus] = useState(false)
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

    useEffect(() => {
        if(uploadStatus) {
            setCameraOpen(false)
            setFrozenImage(null)
            setPushUpload(false)
            setUploadStatus(false)
        }
    }, [uploadStatus])

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
        if (!frozenImage || !employeeId) return;
      
        setPushUpload(true);
        const base64Only = frozenImage.split(',')[1];
      
        uploadReceipt(base64Only, employeeId)
          .then((response) => {
            if (response.ok) {
              setUploadStatus(true);
            }
            return response.text();
          })
          .then((result) => console.log(result))
          .catch((error) => {
            console.error(error);
            setUploadStatus(false);
          });
      };
      
      
    if (loading) {
        return (
        <LoadingContainer>
            <CircularProgress size={60} />
        </LoadingContainer>
        );
    }

  return (
    <Grid item container xs={12} sx={{ height: "100svh", width: "100vw" , backgroundColor: primaryColor, position: "relative"}}>
        <Grid
        container
        sx={{ 
            height: cameraOpen ? frozenImage? "0%" : "100%" : "70%",
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
        {
            cameraOpen ?     
            <Button
            onClick={toggleCamera}
            sx={{
                position: "absolute",
                top : "2%",
                left: "2%",
            }}
            >
                <CloseIcon 
                    sx={{
                        border: "1px solid #fff",
                        borderRadius: "50%",
                        color : "#fff",
                        fontSize: 28,
                        zIndex: 1000
                    }}
                />
            </Button> : <></>
        }
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
            height: cameraOpen ? frozenImage ? "100%" : "0%" : "30%",
            width: "100%",
            backgroundColor: frozenImage ? primaryColor : tertiaryColor,
            borderTopLeftRadius: frozenImage ? 0: 30,
            borderTopRightRadius: frozenImage ? 0 : 30,
            zIndex: 20,
            position: "relative",
            transition: "height 0.5s ease-in-out",
            justifyContent: "center",
            alignItems: "flex-start"
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
                border: cameraOpen ? "3px solid #fff" : "none"
            }}
            >
            <p 
            style={{
                opacity: cameraOpen ? 0 : 1, 
                transition: "opacity 0.2s ease-in-out 0.7s",
            }}>{cameraOpen ? "" : "Open Camera"}</p>
            </Button>
            {cameraOpen && (
                frozenImage ? (
                <FrozenImageWrapper container sx={{
                    width : pushUpload ? "100%" : "90%",
                    transition: "all 0.7s ease-in-out"
                }}>
                    <Grid container
                    sx={{
                        width: '100%',
                        height: '100%',
                        justifyContent : "center",
                        alignItems : "center",
                        marginTop: "8%",
                        marginBottom: "5%",
                        position: "relative"
                    }}>
                        <FrozenImage src={frozenImage} alt="Captured" upload={pushUpload}/>
                        {
                            pushUpload ? <Grid
                            sx={{
                                position : "absolute",
                                opacity: pushUpload ? 1 : 0,
                                right: uploadStatus ? "0%" : "35%",
                                transition: "opacity 1.5s ease-in-out 3s, right 0.7s ease-in-out",
                            }}>
                                <FloatingImage 
                                src="https://img.icons8.com/?size=100&id=499&format=png&color=ffffff"
                                alt="icon"
                                />
                            </Grid> : <></>
                        }
                    </Grid>
                    <Button
                    variant="contained"
                    onClick={handleUpload}
                    sx={{
                        height: "50px",
                        width: pushUpload ? "100%" : "250px",
                        borderRadius: pushUpload ? 0 : 8,
                        fontSize: 16,
                        transition: "all 0.7s ease-in-out",
                        border: cameraOpen ? "3px solid #fff" : "none",
                        borderLeft: pushUpload ? 0 : "3px solid #fff",
                        borderRight: pushUpload ? 0 : "3px solid #fff",
                        backgroundColor: secondaryColor,
                        transition: "all 0.7s ease-in-out"
                    }}
                    >
                    <p 
                    style={{
                        opacity: frozenImage ? 1 : 0, 
                        transition: "opacity 0.2s ease-in-out 0.7s",
                    }}>{frozenImage ? pushUpload? "Upload in Progress.." : "Upload" : ""}</p>
                    </Button>
                </FrozenImageWrapper>
                ) : <></>
                )
            }
        </Grid>
    </Grid>
  );
};

export default Upload;
