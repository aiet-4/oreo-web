import { useState, useEffect } from 'react';
import { 
  Grid, 
  Typography, 
  Paper, 
  Box, 
  Card, 
  CardContent, 
  CardHeader, 
  Chip, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  Stepper, 
  Step, 
  StepLabel,
  CircularProgress,
  Button,
  Avatar
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import fetchAllFiles from './api/dashboard';
import ReactMarkdown from 'react-markdown';

const primaryColor = "#162a53";
const secondaryColor = "#f79d35";
const tertiaryColor = "#fdfbfc";

// Process the raw data to a more usable format
function processData(rawData) {
  if (!rawData || !rawData.data) return [];
  
  const processedData = [];
  
  // Loop through each file
  Object.keys(rawData.data).forEach(fileId => {
    const fileData = rawData.data[fileId];
    const fileInfo = {
      id: fileId,
      stages: []
    };
    
    // Extract basic info from stage 1 if available
    if (fileData["stage:1"]) {
      fileInfo.employeeId = fileData["stage:1"].employee_id;
      fileInfo.img_base64 = fileData["stage:1"].img_base64;
    }
    
    // Extract receipt type from stage 2 if available
    if (fileData["stage:2"]) {
      fileInfo.receiptType = fileData["stage:2"].receipt_type;
    }
    
    // Process all stages
    Object.keys(fileData).forEach(stageKey => {
      const stageData = fileData[stageKey];
      const stageNumber = stageKey.split(":")[1];
      
      // Handle array stages (like stage:6)
      if (Array.isArray(stageData)) {
        stageData.forEach(item => {
          fileInfo.stages.push({
            stageNumber: item.stage || stageNumber,
            subStage: item.sub_stage,
            name: item.stage_name,
            details: item
          });
        });
      } else {
        // Handle single object stages
        fileInfo.stages.push({
          stageNumber: stageData.stage || stageNumber,
          name: stageData.stage_name,
          details: stageData
        });
      }
    });
    
    // Extract employee name from stage 6 if available
    if (fileData["stage:6"] && Array.isArray(fileData["stage:6"])) {
      const employeeDataItem = fileData["stage:6"].find(item => item.employee_data);
      if (employeeDataItem && employeeDataItem.employee_data) {
        try {
          const employeeData = JSON.parse(employeeDataItem.employee_data);
          fileInfo.employeeName = employeeData.name;
          fileInfo.employeeEmail = employeeData.email;
          fileInfo.employeeLevel = employeeData.level;
          fileInfo.currentExpenses = employeeData.current_expenses;
        } catch (e) {
          console.error("Error parsing employee data:", e);
        }
      }
      
      // Check for email details
      const emailItem = fileData["stage:6"].find(item => item.stage_name === "Send Email");
      if (emailItem) {
        fileInfo.emailSent = true;
        fileInfo.emailSubject = emailItem.subject;
        fileInfo.emailContent = emailItem.content;
      }
      
      // Check for expense update
      const expenseUpdateItem = fileData["stage:6"].find(item => item.stage_name === "Updating Employee Expense");
      if (expenseUpdateItem) {
        fileInfo.expenseUpdate = {
          from: expenseUpdateItem.from,
          to: expenseUpdateItem.to,
          difference: expenseUpdateItem.to - expenseUpdateItem.from
        };
      }
    }
    
    // Sort stages by stage number
    fileInfo.stages.sort((a, b) => {
      if (a.stageNumber === b.stageNumber) {
        return (a.subStage || 0) - (b.subStage || 0);
      }
      return a.stageNumber - b.stageNumber;
    });

    // Get the latest stage
    fileInfo.currentStage = fileInfo.stages.length > 0 ? 
      Math.max(...fileInfo.stages.map(s => parseInt(s.stageNumber))) : 0;
    
    processedData.push(fileInfo);
  });
  
  return processedData;
}

// Main component
function Dashboard() {
  const [allFiles, setAllFiles] = useState(null);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getFiles = async () => {
      try {
        const response = await fetchAllFiles();
        if (response.ok) {
          const data = await response.json();
          setAllFiles(data);
          const processed = processData(data);
          setProcessedFiles(processed);
          if (processed.length > 0) {
            setSelectedItem(processed[0]);
          }
        } else {
          setError("Failed to fetch data");
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
        setError("Error fetching data");
        setLoading(false);
      }
    };
  
    getFiles();
  }, []);

  // Format expense type for display
  const formatExpenseType = (type) => {
    if (!type) return "";
    return type.replace(/_/g, " ").toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Step labels for the stepper
  const steps = [
    'Processing Starts',
    'Receipt Type Identified',
    'OCR Processing',
    'Text Extraction',
    'Data Analysis',
    'Completion'
  ];

  if (loading) {
    return (
      <Grid container justifyContent="center" alignItems="center" sx={{ height: "100vh" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading receipt data...</Typography>
      </Grid>
    );
  }

  if (error) {
    return (
      <Grid container justifyContent="center" alignItems="center" sx={{ height: "100vh" }}>
        <Typography variant="h6" color="error">{error}</Typography>
      </Grid>
    );
  }

  return (
    <Grid container xs={12} sx={{ height: "100svh", width: "100vw" , backgroundColor: tertiaryColor}}>
      <Grid container sx={{
        height: "10%",
        width: "100%",
        justifyContent:"center",
        alignItems:"center"
      }}>
        <Typography variant="h4" sx={{ color: primaryColor, fontWeight: 600 }}>
          Agentic Receipt Processing Dashboard
        </Typography>
      </Grid>

      <Grid container sx={{
        height: "90%",
        width: "100%",
      }}>
        {processedFiles.length === 0 ? (
          <Grid container justifyContent="center" alignItems="center" sx={{ height: "100%" , width : "100%"}}>
            <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
              <HourglassEmptyIcon sx={{ fontSize: 60, color: primaryColor, mb: 2 }} />
              <Typography variant="h5">No Receipts Found</Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                Upload a receipt to start processing
              </Typography>
            </Paper>
          </Grid>
        ) : (
          <Grid container sx={{
            width: "100%",
            height: "100%",
          }}>
            <Grid item sx={{
              width: "30%",
              px: 2
            }}>
              <Paper elevation={3} sx={{ p: 2, maxHeight: "80%", overflow: "auto" }}>
                <Typography variant="h6" sx={{ mb: 2, color: primaryColor }}>
                  Receipts
                </Typography>
                <List>
                  {processedFiles.map((file) => (
                    <ListItem 
                      key={file.id} 
                      button 
                      selected={selectedItem?.id === file.id}
                      onClick={() => setSelectedItem(file)}
                      sx={{
                        mb: 1,
                        backgroundColor: selectedItem?.id === file.id ? `${primaryColor}22` : "white",
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: `${primaryColor}15`
                        }
                      }}
                    >
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' , py : 0.5}}>
                            <ReceiptLongIcon sx={{ mr: 1, color: secondaryColor }} />
                            <Typography variant="body1" sx={{  fontWeight: 500 }}>
                              {file.employeeName || file.employeeId || "Unknown Employee"}
                            </Typography>
                          </Box>
                        } 
                        secondary={
                          <>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {formatExpenseType(file.receiptType)}
                            </Typography>
                          </>
                        }
                      />
                      {file.currentStage >= 6 && <CheckCircleIcon sx={{ color: "#4caf50" }} />}
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
            
            {selectedItem && (
              <Grid item sx={{
                width: "70%",
              }}>
                <Paper elevation={3} sx={{ maxHeight: "85vh", overflowY: "auto" , px: 2, py: 2}}>
                  <Typography variant="h5" sx={{ mb: 2, color: primaryColor, fontWeight: 600 }}>
                    Receipt Details
                  </Typography>
                  
                  <Stepper activeStep={selectedItem.currentStage - 1} alternativeLabel sx={{ mb: 4 }}>
                    {steps.map((label) => (
                      <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                  
                  <Grid container sx={{
                    justifyContent:"center",
                    py: 4
                  }}>
                    <Grid container xs={12} sx={{
                      width: "85%",
                      justifyContent : "center",
                      alignItems: "flex-start",
                      rowGap: 4
                    }}>
                      <Card elevation={2} sx={{ width : "100%"}}>
                        <CardHeader 
                          title={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <ReceiptLongIcon sx={{ mr: 1, color: secondaryColor }} />
                              <Typography variant="h6">Receipt Information</Typography>
                            </Box>
                          }
                          sx={{ backgroundColor: `${primaryColor}11`, pb: 1 }}
                        />
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle2" color="textSecondary">Type:</Typography>
                            <Chip 
                              label={formatExpenseType(selectedItem.receiptType)} 
                              size="small" 
                              sx={{ backgroundColor: secondaryColor, color: 'white' }}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle2" color="textSecondary">File ID:</Typography>
                            <Typography variant="body2" sx={{ maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {selectedItem.id?.substring(0, 12)}...
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle2" color="textSecondary">Current Stage:</Typography>
                            <Typography variant="body2">{steps[selectedItem.currentStage - 1]}</Typography>
                          </Box>
                          
                          {selectedItem.expenseUpdate && (
                            <>
                              <Divider sx={{ my: 2 }} />
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <PaymentIcon sx={{ mr: 1, color: secondaryColor }} />
                                <Typography variant="subtitle1">Expense Update</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle2" color="textSecondary">Previous Amount:</Typography>
                                <Typography variant="body2">₹{selectedItem.expenseUpdate.from}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle2" color="textSecondary">New Amount:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{selectedItem.expenseUpdate.to}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle2" color="textSecondary">Difference:</Typography>
                                <Typography variant="body2" color="success.main">+₹{selectedItem.expenseUpdate.difference}</Typography>
                              </Box>
                            </>
                          )}
                        </CardContent>
                      </Card>
                      
                      {selectedItem.emailSent && (
                        <Card elevation={2} sx={{ width : "100%"}}>
                        <CardHeader 
                            title={
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <EmailIcon sx={{ mr: 1, color: secondaryColor }} />
                                <Typography variant="h6">Email Notification</Typography>
                              </Box>
                            }
                            sx={{ backgroundColor: `${primaryColor}11`, pb: 1 }}
                          />
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="subtitle2" color="textSecondary">To:</Typography>
                              <Typography variant="body2">{selectedItem.employeeEmail}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="subtitle2" color="textSecondary">Subject:</Typography>
                              <Typography variant="body2">{selectedItem.emailSubject}</Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>Content:</Typography>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                              {selectedItem.emailContent}
                            </Typography>
                          </CardContent>
                        </Card>
                      )}
                    </Grid>
                    
                    <Grid container xs={12} sx={{
                      width: "85%",
                      justifyContent : "center",
                      alignItems: "flex-start",
                      paddingTop: 4,
                      rowGap: 4
                    }}>
                    <Card elevation={2} sx={{ width : "100%"}}>
                    <CardHeader 
                          title={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <PersonIcon sx={{ mr: 1, color: secondaryColor }} />
                              <Typography variant="h6">Employee Information</Typography>
                            </Box>
                          }
                          sx={{ backgroundColor: `${primaryColor}11`, pb: 1 }}
                        />
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Avatar sx={{ bgcolor: primaryColor, mr: 2 }}>
                              {(selectedItem.employeeName?.charAt(0) || selectedItem.employeeId?.charAt(0) || "U")}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {selectedItem.employeeName || "Unknown Name"}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {selectedItem.employeeId || "No ID"}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle2" color="textSecondary">Email:</Typography>
                            <Typography variant="body2">{selectedItem.employeeEmail || "N/A"}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle2" color="textSecondary">Level:</Typography>
                            <Typography variant="body2">{selectedItem.employeeLevel || "N/A"}</Typography>
                          </Box>
                          
                          {selectedItem.currentExpenses && (
                            <>
                              <Divider sx={{ my: 2 }} />
                              <Typography variant="subtitle1" sx={{ mb: 2 }}>Current Expenses</Typography>
                              {Object.entries(selectedItem.currentExpenses).map(([type, amount]) => (
                                <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="subtitle2" color="textSecondary">{formatExpenseType(type)}:</Typography>
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      fontWeight: selectedItem.receiptType === type ? 600 : 400,
                                      color: selectedItem.receiptType === type ? 'success.main' : 'inherit'
                                    }}
                                  >
                                    ₹{amount}
                                  </Typography>
                                </Box>
                              ))}
                            </>
                          )}
                        </CardContent>
                      </Card>
                      
                      <Card elevation={2} sx={{ width : "100%"}}>
                      <CardHeader 
                          title={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <HourglassEmptyIcon sx={{ mr: 1, color: secondaryColor }} />
                              <Typography variant="h6">Processing Timeline</Typography>
                            </Box>
                          }
                          sx={{ backgroundColor: `${primaryColor}11`, pb: 1 }}
                        />
                        <CardContent>
                          <List sx={{ width: '100%', p: 0 }}>
                            {selectedItem.stages.map((stage, index) => (
                              <ListItem key={index} sx={{ py: 0, px: 0 }}>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    width: '100%',
                                    borderLeft: '2px solid',
                                    borderColor: 'grey.300',
                                    py: 1,
                                    pl: 2,
                                    position: 'relative',
                                    '&:before': {
                                      content: '""',
                                      position: 'absolute',
                                      left: '-5px',
                                      top: '12px',
                                      width: '8px',
                                      height: '8px',
                                      borderRadius: '50%',
                                      backgroundColor: secondaryColor,
                                    }
                                  }}
                                >
                                  <ListItemText
                                    primary={
                                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                        {stage.name}
                                      </Typography>
                                    }
                                    secondary={
                                      <Typography variant="caption" color="text.secondary">
                                        Stage {stage.stageNumber}
                                      </Typography>
                                    }
                                  />
                                <Grid container sx={{ width: "400px" }}>
                                  {stage.stageNumber === 2 && (
                                    <Paper elevation={2} sx={{ p: 2, width: '100%', overflowX: "hidden"}}>
                                      <ReactMarkdown>{stage.details.receipt_type || ""}</ReactMarkdown>
                                    </Paper>
                                  )}
                                  {stage.stageNumber === 3 && (
                                    <Paper elevation={2} sx={{ p: 2, width: '100%', overflowX: "hidden"}}>
                                      <ReactMarkdown>{stage.details.extracted_content || ""}</ReactMarkdown>
                                    </Paper>
                                  )}
                                  {stage.stageNumber === 5 && (
                                    <Paper elevation={2} sx={{ p: 2, width: '100%', overflowX: "hidden"}}>
                                      <ReactMarkdown>{stage.details.system_prompt || ""}</ReactMarkdown>
                                    </Paper>
                                  )}
                                  {stage.stageNumber === 6 && (
                                    <Paper elevation={2} sx={{ p: 2, width: '100%', overflowX: "scroll"}}>
                                      <ReactMarkdown>{`**REASONING**\n\n${stage.details.reasoning}\n\n**ACTION**\n\n\`\`\`json\n${JSON.stringify(stage.details.tool, null, 4)}\n\`\`\``}</ReactMarkdown>
                                    </Paper>
                                  )}
                                </Grid>
                                </Box>
                              </ListItem>
                            ))}
                          </List>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                  
                  {selectedItem.img_base64 && (
                  <Grid container xs={12} sx={{
                    width: "100%",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    rowGap: 4,
                  }}>
                    <Card elevation={2} sx={{ width: "85%" }}>
                      <CardHeader 
                        title="Receipt Image"
                        sx={{ backgroundColor: `${primaryColor}11`, pb: 1 }}
                      />
                      <CardContent sx={{ textAlign: 'center' }}>
                        {/* Image container with max-height to prevent oversized images */}
                        <Box sx={{ 
                          maxHeight: "400px", 
                          overflow: "auto", 
                          display: "flex", 
                          justifyContent: "center",
                          border: "1px solid #eee",
                          borderRadius: "4px",
                          p: 2,
                          mb: 2
                        }}>
                          <img 
                            src={`data:image/jpeg;base64,${selectedItem.img_base64}`} 
                            alt="Receipt" 
                            style={{ 
                              maxWidth: "100%", 
                              objectFit: "contain"
                            }} 
                          />
                        </Box>
                        
                        {/* Keep the button as a backup in case the image fails to load */}
                        <Button 
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => window.open(`data:image/jpeg;base64,${selectedItem.img_base64}`, '_blank')}
                        >
                          Open Image in New Tab
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                )}
                </Paper>
              </Grid>
            )}
          </Grid>
        )}
      </Grid>
      
    </Grid>
  );
}

export default Dashboard