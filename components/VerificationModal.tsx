import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Pressable,
  Keyboard,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface VerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onVerify: (code: string) => Promise<void>;
  onResend?: () => Promise<void>;
  email: string;
}

export default function VerificationModal({
  visible,
  onClose,
  onSuccess,
  onVerify,
  onResend,
  email,
}: VerificationModalProps) {
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionRef = useRef(0);

  // Helper to clear timeout safely
  const clearSuccessTimeout = () => {
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (visible) {
      sessionRef.current += 1; // Start a new verification session
      setCode("");
      setError(null);
      setIsVerifying(false);
      // Autofocus after modal transition animation
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => {
        clearTimeout(timer);
        clearSuccessTimeout();
      };
    } else {
      sessionRef.current += 1; // Invalidate active requests on hide
      clearSuccessTimeout();
    }
  }, [visible]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      clearSuccessTimeout();
    };
  }, []);

  const handleClose = () => {
    sessionRef.current += 1; // Invalidate active requests on close
    clearSuccessTimeout();
    onClose();
  };

  const handleResend = async () => {
    if (onResend) {
      try {
        setError(null);
        await onResend();
        Alert.alert("Code Sent", "A new verification code has been sent to your email.");
      } catch (err: any) {
        setError(err.message || "Failed to resend verification code.");
      }
    }
  };

  const handleChangeText = (text: string) => {
    if (isVerifying) return; // Prevent input changes during active verification

    setError(null); // Reset error state on typing
    const cleanText = text.replace(/[^0-9]/g, "");
    setCode(cleanText);

    if (cleanText.length === 6) {
      // Dismiss keyboard first for smooth UX
      Keyboard.dismiss();
      setIsVerifying(true);

      const sessionStarted = sessionRef.current;

      // Trigger dynamic verification callback
      onVerify(cleanText)
        .then(() => {
          // Verify result still belongs to current visible session
          if (sessionStarted !== sessionRef.current || !visible) {
            return; // Discard stale/dismissed session result
          }

          clearSuccessTimeout();
          successTimeoutRef.current = setTimeout(() => {
            // Confirm session is still valid before invoking success callback
            if (sessionStarted === sessionRef.current && visible) {
              onSuccess();
            }
            setIsVerifying(false);
          }, 250);
        })
        .catch((err) => {
          if (sessionStarted !== sessionRef.current || !visible) {
            return;
          }
          setIsVerifying(false);
          setError(err.message || "Invalid verification code. Please try again.");
          setCode(""); // Clear boxes for retry
          // Refocus hidden text input for retry
          setTimeout(() => {
            if (sessionStarted === sessionRef.current && visible) {
              inputRef.current?.focus();
            }
          }, 100);
        });
    }
  };

  const handleBoxPress = () => {
    if (!isVerifying) {
      inputRef.current?.focus();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable 
        style={styles.backdrop} 
        onPress={() => {
          Keyboard.dismiss();
          handleClose();
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          {/* Modal Container */}
          <Pressable 
            style={styles.modalContent} 
            onPress={(e) => e.stopPropagation()} // Prevent closing when tapping container
          >
            {/* Header */}
            <View style={styles.header}>
              <Text className="text-h3 font-poppins-bold text-neutral-text-primary">
                Verify Email
              </Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Feather name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Instruction description */}
            <View style={styles.body}>
              <Text className="text-body-medium text-neutral-text-secondary mb-6 text-center">
                {"We've sent a 6-digit verification code to\n"}
                <Text className="font-poppins-semibold text-neutral-text-primary">{email || "your email"}</Text>
              </Text>

              {/* Box inputs wrapper */}
              <Pressable style={styles.otpContainer} onPress={handleBoxPress}>
                {Array.from({ length: 6 }).map((_, index) => {
                  const digit = code[index] || "";
                  const isFocused = index === code.length && !isVerifying;
                  
                  return (
                    <View
                      key={index}
                      style={[
                        styles.otpBox,
                        isFocused && styles.otpBoxFocused,
                        digit !== "" && styles.otpBoxFilled,
                      ]}
                    >
                      <Text
                        className={`text-2xl font-poppins-bold text-center ${
                          isFocused ? "text-primary-purple" : "text-neutral-text-primary"
                        }`}
                      >
                        {digit}
                      </Text>
                    </View>
                  );
                })}
              </Pressable>

              {/* Error feedback message */}
              {error ? (
                <Text className="text-body-small text-semantic-error mt-2 font-poppins-semibold text-center">
                  {error}
                </Text>
              ) : null}

              {/* Hidden text input */}
              <TextInput
                ref={inputRef}
                value={code}
                onChangeText={handleChangeText}
                keyboardType="number-pad"
                maxLength={6}
                style={styles.hiddenInput}
                caretHidden={true}
                editable={!isVerifying}
              />

              {isVerifying ? (
                <Text className="text-body-medium text-primary-purple font-poppins-semibold mt-6 text-center">
                  Verifying code...
                </Text>
              ) : (
                <Text className="text-caption text-neutral-text-secondary text-center mt-6">
                  {"Didn't receive the code? "}
                  <Text 
                    onPress={handleResend}
                    className="font-poppins-semibold text-primary-purple"
                  >
                    Resend
                  </Text>
                </Text>
              )}
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(13, 19, 43, 0.4)", // Muted deep dark backdrop matching brand color
    justifyContent: "flex-end", // Animates up from bottom like standard sheets
  },
  keyboardAvoidingView: {
    width: "100%",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: Platform.OS === "ios" ? 44 : 24,
    shadowColor: "#0D132B",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  body: {
    alignItems: "center",
    width: "100%",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 8,
    marginVertical: 12,
  },
  otpBox: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F6F7FB",
  },
  otpBoxFocused: {
    borderColor: "#6C4EF5",
    backgroundColor: "#FFFFFF",
    shadowColor: "#6C4EF5",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  otpBoxFilled: {
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  hiddenInput: {
    position: "absolute",
    width: 0,
    height: 0,
    opacity: 0,
  },
});
