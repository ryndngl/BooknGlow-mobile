import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  TextInput,
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const GCASH_QR_URL = 'https://res.cloudinary.com/dyw0qxjzn/image/upload/v1761153850/Adobe_Express_-_file_ygwisf.png';

// Cloudinary Config
const CLOUDINARY_CLOUD_NAME = 'dyw0qxjzn';
const CLOUDINARY_UPLOAD_PRESET = 'salon_styles';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

const PaymentMethodScreen = () => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [proofOfPayment, setProofOfPayment] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [amountInput, setAmountInput] = useState("");
  const [showQRModal, setShowQRModal] = useState(false);
  const route = useRoute();
  const navigation = useNavigation();

  const { bookingDetails } = route.params;

  useEffect(() => {
    if (bookingDetails.price) {
      setAmountInput(bookingDetails.price.toString());
    }
  }, [bookingDetails.price]);

  // ✅ UPDATED: No crop, silent upload
  const handleUploadProof = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // ✅ NO CROP - full image
        quality: 0.8,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        setProofOfPayment(imageUri);
        
        // ✅ Silent upload (no loading indicators)
        uploadToCloudinary(imageUri);
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to select image");
    }
  };

  // ✅ UPDATED: Silent background upload
  const uploadToCloudinary = async (uri) => {
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', {
        uri: uri,
        type: 'image/jpeg',
        name: `payment_proof_${Date.now()}.jpg`,
      });
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', 'payment-proofs');

      // Silent upload in background
      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (data.secure_url) {
        setUploadedImageUrl(data.secure_url);
        // ✅ NO alert - silent success
      }
    } catch (error) {
      console.error("Upload error:", error);
      // Only show error alert
      Alert.alert("Upload Failed", "Failed to upload image. Please try again.");
      setProofOfPayment(null);
    }
  };

  const handleConfirm = () => {
    if (!selectedMethod) {
      Alert.alert("Error", "Please select a payment method");
      return;
    }

    if (selectedMethod === "GCash") {
      if (!uploadedImageUrl) {
        Alert.alert("Error", "Please upload proof of payment for GCash");
        return;
      }
      if (!amountInput || parseFloat(amountInput) <= 0) {
        Alert.alert("Error", "Please enter the amount you paid");
        return;
      }
    }

    const updatedBooking = {
      ...bookingDetails,
      paymentMethod: selectedMethod,
      paymentProofUrl: uploadedImageUrl || null,
      amountPaid: selectedMethod === "GCash" ? amountInput : null,
      status: "Pending",
    };

    navigation.navigate("BookingConfirmationScreen", {
      bookingDetails: updatedBooking,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment Method</Text>
        </View>
        
        {/* GCash Option */}
        <TouchableOpacity
          style={[
            styles.paymentCard,
            selectedMethod === "GCash" && styles.paymentCardSelected,
          ]}
          onPress={() => setSelectedMethod("GCash")}
          activeOpacity={0.7}
        >
          <View style={styles.paymentHeader}>
            <View style={styles.paymentInfo}>
              <FontAwesome5 name="wallet" size={24} color="#007DFF" />
              <Text style={styles.paymentLabel}>GCash</Text>
            </View>
            {selectedMethod === "GCash" && (
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            )}
          </View>
        </TouchableOpacity>

        {/* GCash Section */}
        {selectedMethod === "GCash" && (
          <View style={styles.gcashSection}>
            {/* No Refund Policy */}
            <View style={styles.policyNotice}>
              <Ionicons name="alert-circle" size={20} color="#FF6B6B" />
              <Text style={styles.policyText}>
                No Refund Policy: All payments are final and non-refundable
              </Text>
            </View>

            {/* QR Code */}
            <View style={styles.qrContainer}>
              <Text style={styles.instructionText}>Scan QR Code to Pay</Text>
              <TouchableOpacity 
                onPress={() => setShowQRModal(true)}
                activeOpacity={0.8}
              >
                <Image 
                  source={{ uri: GCASH_QR_URL }}
                  style={styles.qrCode}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <View style={styles.tapToViewContainer}>
                <Ionicons name="expand-outline" size={16} color="#007DFF" />
                <Text style={styles.tapToViewText}>Tap image to view full screen</Text>
              </View>
            </View>

            {/* Upload Section */}
            <View style={styles.uploadSection}>
              <Text style={styles.uploadLabel}>
                Upload Proof of Payment <Text style={styles.required}>*</Text>
              </Text>

              {proofOfPayment ? (
                <View style={styles.uploadedContainer}>
                  <Image
                    source={{ uri: proofOfPayment }}
                    style={styles.uploadedImage}
                  />
                  {/* ✅ REMOVED loading overlay */}
                  {uploadedImageUrl && (
                    <View style={styles.uploadSuccessIndicator}>
                      <Ionicons name="cloud-done" size={20} color="#4CAF50" />
                      <Text style={styles.uploadSuccessText}>✓ Uploaded</Text>
                    </View>
                  )}
                  <View style={styles.uploadButtonsRow}>
                    <TouchableOpacity
                      style={styles.changeButton}
                      onPress={handleUploadProof}
                    >
                      <Ionicons name="images-outline" size={18} color="#fff" />
                      <Text style={styles.changeButtonText}>Change</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.doneButton, !uploadedImageUrl && styles.doneButtonDisabled]}
                      disabled={!uploadedImageUrl}
                    >
                      <Ionicons name="checkmark-circle" size={18} color="#fff" />
                      <Text style={styles.doneButtonText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={handleUploadProof}
                >
                  <Ionicons name="cloud-upload-outline" size={32} color="#666" />
                  <Text style={styles.uploadButtonText}>Tap to upload screenshot</Text>
                  <Text style={styles.uploadSubtext}>JPG, PNG (Max 5MB)</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Amount Input */}
            <View style={styles.amountInputSection}>
              <Text style={styles.amountInputLabel}>
                Amount Paid <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencySymbol}></Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  value={amountInput}
                  onChangeText={setAmountInput}
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>
        )}

        {/* QR Modal */}
        <Modal
          visible={showQRModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowQRModal(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowQRModal(false)}
              activeOpacity={0.9}
            >
              <Ionicons name="close-circle" size={40} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.modalContentBox}>
              <Image 
                source={{ uri: GCASH_QR_URL }}
                style={styles.enlargedQR}
                resizeMode="contain"
              />
            </View>
            
            <Text style={styles.modalText}>Scan with your GCash app</Text>
          </View>
        </Modal>

        {/* Cash on Service Option */}
        <TouchableOpacity
          style={[
            styles.paymentCard,
            selectedMethod === "Cash on Service" && styles.paymentCardSelected,
          ]}
          onPress={() => setSelectedMethod("Cash on Service")}
          activeOpacity={0.7}
        >
          <View style={styles.paymentHeader}>
            <View style={styles.paymentInfo}>
              <Ionicons name="cash" size={24} color="#4CAF50" />
              <Text style={styles.paymentLabel}>Cash on Service</Text>
            </View>
            {selectedMethod === "Cash on Service" && (
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            )}
          </View>
        </TouchableOpacity>

        {/* Cash Details */}
        {selectedMethod === "Cash on Service" && (
          <View style={styles.cashSection}>
            <View style={styles.cashInfo}>
              <Ionicons name="information-circle" size={20} color="#666" />
              <Text style={styles.cashInfoText}>
                Pay at the salon after your service is completed
              </Text>
            </View>
            <View style={styles.amountDisplay}>
              <Text style={styles.cashLabel}>Amount to Pay:</Text>
              <Text style={styles.cashAmount}>{bookingDetails.price}</Text>
            </View>
          </View>
        )}

        {/* Confirm Button */}
        <TouchableOpacity
          style={[styles.confirmButton, !selectedMethod && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
          disabled={!selectedMethod}
        >
          <Text style={styles.confirmButtonText}>Confirm Payment Method</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PaymentMethodScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginLeft: 16,
  },
  paymentCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  paymentCardSelected: {
    borderColor: "#4CAF50",
    backgroundColor: "#f0fff4",
  },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 12,
  },
  gcashSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,

  },
  policyNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5F5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#FF6B6B",
  },
  policyText: {
    flex: 1,
    fontSize: 12,
    color: "#D63031",
    marginLeft: 8,
    fontWeight: "500",
  },
  qrContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  qrCode: {
    width: 300,
    height: 300,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
  },
  tapToViewContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  tapToViewText: {
    fontSize: 13,
    color: "#007DFF",
    marginLeft: 6,
    fontWeight: "500",
  },
  uploadSection: {
    marginTop: 8,
  },
  uploadLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  required: {
    color: "#f44336",
  },
  uploadButton: {
    backgroundColor: "#f9f9f9",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 150,
  },
  uploadButtonText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  uploadSubtext: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  uploadedContainer: {
    alignItems: "center",
    position: "relative",
  },
  uploadedImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  uploadSuccessIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fff4",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  uploadSuccessText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#4CAF50",
    fontWeight: "600",
  },
  uploadButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  changeButton: {
    backgroundColor: "#666",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  changeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  doneButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  doneButtonDisabled: {
    backgroundColor: "#ccc",
  },
  doneButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  amountInputSection: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  amountInputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    paddingHorizontal: 16,
    width: 150,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    paddingVertical: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.92)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 999,
    padding: 8,
  },
  modalContentBox: {
    width: SCREEN_WIDTH * 0.90,     
    height: SCREEN_HEIGHT * 0.70,    
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",             
    justifyContent: "center",
    alignItems: "center",
  },
  enlargedQR: {
    width: "100%",      
    height: "100%",     
  },
  modalText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    marginTop: 24,
    textAlign: "center",
  },
  cashSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
  },
  cashInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  cashInfoText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
  amountDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  cashLabel: {
    fontSize: 15,
    color: "#666",
  },
  cashAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#4CAF50",
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
  confirmButtonDisabled: {
    backgroundColor: "#ccc",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});