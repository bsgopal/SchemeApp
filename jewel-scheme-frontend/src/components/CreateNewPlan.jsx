import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import axios from "axios";
import { motion } from "framer-motion"; // ✨ added for animation

const CreateNewPlan = ({ onCreatePlan }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const DEFAULT_BANNER = "/images/banner1.jpg";

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [planData, setPlanData] = useState({
    groupCode: '',
    planName: '',
    planType: 'Monthly',
    amountPerInst: '',
    goldWeight: '',
    jewelleryType: '',
    duration: '',
    noOfMembers: '',
    isFlexible: false,
    bonus: 0,
    totalBalance: 0,
    note: '',
    benefits: [''],
    status: 'Active',
    priority: 1,
    banner: '',
    terms: [
      'Minimum subscription period of 12 months',
      'Early withdrawals are not allowed',
      'Additional charges apply for any changes'
    ]
  });

  const [goldRate, setGoldRate] = useState(0);

  // fetch live goldRate
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/rates`);
        setGoldRate(res.data.goldRate || 0);
      } catch (err) {
        console.error("Failed to fetch rates", err);
      }
    };
    fetchRates();
  }, []);

  // fetch existing plan for edit
  useEffect(() => {
    if (id) {
      axios.get(`${process.env.REACT_APP_API_URL}/api/scheme-groups/${id}`)
        .then(res => {
          const d = res.data.data || res.data;
          setPlanData({
            groupCode: d.group_code || '',
            planName: d.plan_name || '',
            planType: d.plan_type || 'Monthly',
            amountPerInst: d.amount_per_inst || '',
            goldWeight: d.gold_weight || '',
            jewelleryType: d.jewellery_type || '',
            duration: d.no_of_inst || '',
            noOfMembers: d.no_of_members || '',
            isFlexible: !!d.is_flexible,
            bonus: d.bonus || 0,
            totalBalance: d.total_balance_amt || 0,
            note: d.note || d.description || '',
            benefits: d.benefits?.length ? d.benefits : [''],
            status: d.status || 'Active',
            priority: d.priority || 1,
            banner: d.banner_path || '',
            terms: d.terms?.length ? d.terms : [
              'Minimum subscription period of 12 months',
              'Early withdrawals are not allowed',
              'Additional charges apply for any changes'
            ]
          });
        })
        .catch(err => console.error("Error loading plan:", err));
    }
  }, [id]);

  const handleInputChange = (field, value) => {
    if (field === "groupCode" || field === "planName") {
      value = value?.toUpperCase();
    }
    setPlanData(prev => {
      let updated = { ...prev, [field]: value };

      const amt = field === 'amountPerInst' ? value : prev.amountPerInst;
      const dur = field === 'duration' ? value : prev.duration;

      if (amt && dur) {
        const totalBalance = parseFloat(amt) * parseInt(dur);
        updated.totalBalance = totalBalance;

        if (goldRate > 0) {
          updated.goldWeight = (totalBalance / goldRate).toFixed(3);
        }
      }
      return updated;
    });
  };

  const handleBenefitChange = (index, value) => {
    const newBenefits = [...planData.benefits];
    newBenefits[index] = value;
    setPlanData(prev => ({ ...prev, benefits: newBenefits }));
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("banner", file);

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/groups`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        setPlanData(prev => ({ ...prev, banner: res.data.url }));
      } else {
        alert("Image upload failed: " + res.data.message);
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      alert("Error uploading image: " + err.message);
    }
  };

  const addBenefit = () => {
    setPlanData(prev => ({ ...prev, benefits: [...prev.benefits, ''] }));
  };

  const removeBenefit = (index) => {
    const newBenefits = planData.benefits.filter((_, i) => i !== index);
    setPlanData(prev => ({ ...prev, benefits: newBenefits }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("banner", planData.banner);
      formData.append("group_code", planData.groupCode);
      formData.append("plan_name", planData.planName);
      formData.append("plan_type", planData.planType);
      formData.append("description", planData.note || "");
      formData.append("amount_per_inst", planData.amountPerInst);
      formData.append("gold_weight", planData.goldWeight);
      formData.append("jewellery_type", planData.jewelleryType);
      formData.append("duration", planData.duration);
      formData.append("no_of_members", planData.noOfMembers);
      formData.append("is_flexible", planData.isFlexible);
      formData.append("is_gold_scheme", 1);
      formData.append("bonus", planData.bonus);
      formData.append("total_balance", planData.totalBalance);
      formData.append("note", planData.note);
      formData.append("status", planData.status);
      formData.append("priority", planData.priority);
      formData.append("branch_id", 1);
      formData.append("sync_status", "");

      if (!planData.banner) {
        formData.append("banner", DEFAULT_BANNER);
      } else if (planData.banner instanceof File) {
        formData.append("banner", planData.banner);
      } else {
        formData.append("banner", planData.banner);
      }

      planData.benefits?.forEach((b, i) => formData.append(`benefits[${i}]`, b));
      planData.terms?.forEach((t, i) => formData.append(`terms[${i}]`, t));

      let res;
      if (id) {
        res = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/scheme-groups/${id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        res = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/scheme-groups`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      if (res.data.success) {
        setSnackbar({
          open: true,
          message: id ? "Plan updated successfully!" : "Plan created successfully!",
          severity: "success",
        });
        if (!id) handleReset();
      } else {
        setSnackbar({
          open: true,
          message: "Failed: " + res.data.message,
          severity: "error",
        });
      }
    } catch (err) {
      console.error("Error saving plan:", err);
      setSnackbar({
        open: true,
        message: "Error saving plan: " + err.message,
        severity: "error",
      });
    }
  };

  const handleReset = () => {
    setPlanData({
      groupCode: '',
      planName: '',
      planType: 'Monthly',
      amountPerInst: '',
      goldWeight: '',
      jewelleryType: '',
      duration: '',
      noOfMembers: '',
      isFlexible: false,
      bonus: 0,
      totalBalance: 0,
      note: '',
      benefits: [''],
      status: 'Active',
      priority: 1,
      banner: '',
      terms: [
        'Minimum subscription period of 12 months',
        'Early withdrawals are not allowed',
        'Additional charges apply for any changes'
      ]
    });
  };

  return (
    <Box
      sx={{
        p: 3,
        minHeight: "100vh",
        background: "linear-gradient(135deg,#1a1a1a,  #3a004d)",
        color: "white",
      }}
    >
      {/* Back Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={() => navigate('/home')}
          sx={{ mr: 1, color: '#ffb74d' }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 600, letterSpacing: 1 }}>
          {id ? "Edit Plan" : "Create New Plan"}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          {/* Animated Card */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            whileHover={{ scale: 1.02, boxShadow: "0 15px 40px rgba(255, 152, 0, 0.5)" }}
          >
            <Card
              sx={{
                background: "linear-gradient(145deg, #28085fff, #333)",
                borderRadius: 4,
                boxShadow: "0 8px 25px rgba(56, 19, 115, 0.6)",
                color: "white",
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ fontWeight: 600, color: "#ffcc80", mb: 2 }}
                >
                  Plan Details
                </Typography>

                <form onSubmit={handleSubmit}>
                  {/* Group Code */}
                  <TextField
                    fullWidth
                    label="Group Code"
                    value={planData.groupCode}
                    onChange={(e) =>
                      handleInputChange('groupCode', e.target.value.toUpperCase())
                    }
                    margin="normal"
                    required
                    InputLabelProps={{ style: { color: "#ccc", border: "#d4af37" } }}
                    InputProps={{ style: { color: "white" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#ffcc80" }, // default border
                        "&:hover fieldset": { borderColor: "#ffa726" }, // hover border
                        "&.Mui-focused fieldset": { borderColor: "#ff9800" }, // focused border
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Plan Name"
                    value={planData.planName}
                    onChange={(e) =>
                      handleInputChange('planName', e.target.value)
                    }
                    margin="normal"
                    required
                    InputLabelProps={{ style: { color: "#ccc" } }}
                    InputProps={{ style: { color: "white" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#ffcc80" }, // default border
                        "&:hover fieldset": { borderColor: "#ffa726" }, // hover border
                        "&.Mui-focused fieldset": { borderColor: "#ff9800" }, // focused border
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    select
                    label="Plan Type"
                    value={planData.planType}
                    onChange={(e) => handleInputChange('planType', e.target.value)}
                    margin="normal"
                    InputLabelProps={{ style: { color: "#ccc" } }}
                    InputProps={{ style: { color: "white" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#ffcc80" }, // default border
                        "&:hover fieldset": { borderColor: "#ffa726" }, // hover border
                        "&.Mui-focused fieldset": { borderColor: "#ff9800" }, // focused border
                      },
                    }}
                  >
                    <MenuItem value="Monthly">Monthly</MenuItem>
                    <MenuItem value="Quarterly">Quarterly</MenuItem>
                    <MenuItem value="Yearly">Yearly</MenuItem>
                  </TextField>

                  <TextField
                    fullWidth
                    label="Amount per Installment (₹)"
                    type="number"
                    value={planData.amountPerInst}
                    onChange={(e) =>
                      handleInputChange('amountPerInst', e.target.value)
                    }
                    margin="normal"
                    required
                    InputLabelProps={{ style: { color: "#ccc" } }}
                    InputProps={{ style: { color: "white" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#ffcc80" }, // default border
                        "&:hover fieldset": { borderColor: "#ffa726" }, // hover border
                        "&.Mui-focused fieldset": { borderColor: "#ff9800" }, // focused border
                      },
                    }}
                  />

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Gold Weight"
                      type="number"
                      value={planData.goldWeight}
                      onChange={(e) =>
                        handleInputChange('goldWeight', e.target.value)
                      }
                      margin="normal"
                      disabled
                      InputLabelProps={{ style: { color: "#ccc" } }}
                      InputProps={{ style: { color: "white" } }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: "#ffcc80" }, // default border
                          "&:hover fieldset": { borderColor: "#ffa726" }, // hover border
                          "&.Mui-focused fieldset": { borderColor: "#ff9800" }, // focused border
                        },
                      }}
                    />

                    <TextField
                      fullWidth
                      select
                      label="Jewellery Type"
                      value={planData.jewelleryType}
                      onChange={(e) =>
                        handleInputChange('jewelleryType', e.target.value)
                      }
                      margin="normal"
                      InputLabelProps={{ style: { color: "#ccc" } }}
                      InputProps={{ style: { color: "white" } }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: "#ffcc80" }, // default border
                          "&:hover fieldset": { borderColor: "#ffa726" }, // hover border
                          "&.Mui-focused fieldset": { borderColor: "#ff9800" }, // focused border
                        },
                      }}
                    >
                      <MenuItem value="Ring">Ring</MenuItem>
                      <MenuItem value="Necklace">Necklace</MenuItem>
                      <MenuItem value="Bracelet">Bracelet</MenuItem>
                      <MenuItem value="Earrings">Earrings</MenuItem>
                      <MenuItem value="All">All Types</MenuItem>
                    </TextField>
                  </Box>

                  <TextField
                    fullWidth
                    label="Duration (Months)"
                    type="number"
                    value={planData.duration}
                    onChange={(e) =>
                      handleInputChange('duration', e.target.value)
                    }
                    margin="normal"
                    required
                    InputLabelProps={{ style: { color: "#ccc" } }}
                    InputProps={{ style: { color: "white" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#ffcc80" }, // default border
                        "&:hover fieldset": { borderColor: "#ffa726" }, // hover border
                        "&.Mui-focused fieldset": { borderColor: "#ff9800" }, // focused border
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Number of Members"
                    type="number"
                    value={planData.noOfMembers}
                    onChange={(e) =>
                      handleInputChange('noOfMembers', e.target.value)
                    }
                    margin="normal"
                    InputLabelProps={{ style: { color: "#ccc" } }}
                    InputProps={{ style: { color: "white" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#ffcc80" }, // default border
                        "&:hover fieldset": { borderColor: "#ffa726" }, // hover border
                        "&.Mui-focused fieldset": { borderColor: "#ff9800" }, // focused border
                      },
                    }}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={planData.isFlexible}
                        onChange={(e) =>
                          handleInputChange('isFlexible', e.target.checked)
                        }
                      />
                    }
                    label="Flexible Plan"
                    sx={{ color: "white" }}
                  />

                  <TextField
                    fullWidth
                    label="Bonus (%)"
                    type="number"
                    value={planData.bonus}
                    onChange={(e) =>
                      handleInputChange('bonus', e.target.value)
                    }
                    margin="normal"
                    InputLabelProps={{ style: { color: "#ccc" } }}
                    InputProps={{ style: { color: "white" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#ffcc80" }, // default border
                        "&:hover fieldset": { borderColor: "#ffa726" }, // hover border
                        "&.Mui-focused fieldset": { borderColor: "#ff9800" }, // focused border
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Additional Note"
                    multiline
                    rows={3}
                    value={planData.note}
                    onChange={(e) =>
                      handleInputChange('note', e.target.value)
                    }
                    margin="normal"
                    InputLabelProps={{ style: { color: "#ccc" } }}
                    InputProps={{ style: { color: "white" } }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#ffcc80" }, // default border
                        "&:hover fieldset": { borderColor: "#ffa726" }, // hover border
                        "&.Mui-focused fieldset": { borderColor: "#ff9800" }, // focused border
                      },
                    }}
                  />

                  <Divider sx={{ my: 2, borderColor: "#555" }} />
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, color: "#ffb74d" }}
                  >
                    Benefits / Offers
                  </Typography>

                  {planData.benefits.map((benefit, index) => (
                    <Box
                      key={index}
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <TextField
                        fullWidth
                        label={`Benefit ${index + 1}`}
                        value={benefit}
                        onChange={(e) =>
                          handleBenefitChange(index, e.target.value)
                        }
                        margin="normal"
                        InputLabelProps={{ style: { color: "#ccc" } }}
                        InputProps={{ style: { color: "white" } }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": { borderColor: "#ffcc80" }, // default border
                            "&:hover fieldset": { borderColor: "#ffa726" }, // hover border
                            "&.Mui-focused fieldset": { borderColor: "#ff9800" }, // focused border
                          },
                        }}
                      />
                      <IconButton
                        onClick={() => removeBenefit(index)}
                        disabled={planData.benefits.length === 1}
                        sx={{
                          color: "#d74308ff",
                          backgroundColor: "rgba(211, 14, 14, 0.91)",
                          "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
                        }}
                      >
                        <DeleteIcon sx={{ color: "#bc5b35ff" }} />
                      </IconButton>

                    </Box>
                  ))}

                  {/* Banner Upload */}
                  <Box sx={{ my: 2 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      sx={{
                        borderColor: "#ffcc80",
                        color: "#ffcc80",
                        "&:hover": { borderColor: "#ffa726", color: "#ffa726" },
                      }}
                    >
                      Upload Banner
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleBannerUpload}
                      />
                    </Button>

                    {planData.banner && (
                      <Box sx={{ mt: 2 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ color: "#ffcc80", fontWeight: 500 }}
                        >
                          Banner Preview:
                        </Typography>
                        <motion.img
                          src={
                            planData.banner instanceof File
                              ? URL.createObjectURL(planData.banner)
                              : planData.banner.startsWith("http")
                                ? planData.banner
                                : `http://localhost:5000${planData.banner}`
                          }
                          alt="Banner Preview"
                          style={{ width: "100%", borderRadius: 10 }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: [0, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                      </Box>
                    )}
                  </Box>

                  <Button
                    startIcon={<AddIcon />}
                    onClick={addBenefit}
                    variant="outlined"
                    sx={{
                      mb: 2,
                      borderColor: "#ffcc80",
                      color: "#ffcc80",
                      "&:hover": { borderColor: "#ffa726", color: "#ffa726" },
                    }}
                  >
                    Add Benefit
                  </Button>

                  <Divider sx={{ my: 2, borderColor: "#555" }} />
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, color: "#ffb74d" }}
                  >
                    Terms & Conditions
                  </Typography>

                  {planData.terms.map((term, index) => (
                    <TextField
                      key={index}
                      fullWidth
                      label={`Term ${index + 1}`}
                      value={term}
                      onChange={(e) => {
                        const newTerms = [...planData.terms];
                        newTerms[index] = e.target.value;
                        setPlanData((prev) => ({ ...prev, terms: newTerms }));
                      }}
                      margin="normal"
                      InputLabelProps={{ style: { color: "#ccc" } }}
                      InputProps={{ style: { color: "white" } }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": { borderColor: "#ffcc80" }, // default border
                          "&:hover fieldset": { borderColor: "#ffa726" }, // hover border
                          "&.Mui-focused fieldset": { borderColor: "#ff9800" }, // focused border
                        },
                      }}
                    />
                  ))}

                  {/* Action Buttons */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 2,
                      mt: 3,
                    }}
                  >
                    <Button
                      onClick={handleReset}
                      variant="outlined"
                      sx={{
                        borderColor: "#ffcc80",
                        color: "#ffcc80",
                        "&:hover": { borderColor: "#ffa726", color: "#ffa726" },
                      }}
                    >
                      Reset
                    </Button>

                    <Button
                      type="submit"
                      variant="contained"
                      sx={{
                        bgcolor: "#ff9800",
                        color: "#fff",
                        fontWeight: 600,
                        px: 3,
                        "&:hover": { bgcolor: "#e68900" },
                      }}
                    >
                      {id ? "Update Plan" : "Save Plan"}
                    </Button>
                  </Box>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateNewPlan;
