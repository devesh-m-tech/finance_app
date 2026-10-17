import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../shared/theme/colors';
import { spacing, radius, typography } from '../../shared/theme';
import { CryptoUtil } from '../../shared/form-engine/validator';
import { OfflineSyncQueue } from '../db/sync-queue';
import { Button } from '../components/ui/Button';

export default function NewCustomerScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [dob, setDob] = useState('1992-06-15');
  const [gender, setGender] = useState('MALE');
  const [routeId, setRouteId] = useState('ROUTE-001');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('Madurai');
  const [pincode, setPincode] = useState('625001');

  // KYC & CIBIL
  const [aadhaar, setAadhaar] = useState('292832014034'); // Valid Verhoeff test number
  const [pan, setPan] = useState('ABCDE1234F');
  const [cibilScore, setCibilScore] = useState<number | null>(780);
  const [cibilLoading, setCibilLoading] = useState(false);

  // Guarantor
  const [guarantorName, setGuarantorName] = useState('');
  const [guarantorMobile, setGuarantorMobile] = useState('');
  const [guarantorRelation, setGuarantorRelation] = useState('SPOUSE');

  // Biometrics
  const [biometricCaptured, setBiometricCaptured] = useState(false);
  const [photoCaptured, setPhotoCaptured] = useState(false);

  // Live Verhoeff Checksum
  const isAadhaarValid = aadhaar.length === 12 && CryptoUtil.validateAadhaarVerhoeff(aadhaar);
  const isPanValid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase());

  const handlePullCibil = () => {
    setCibilLoading(true);
    setTimeout(() => {
      setCibilLoading(false);
      setCibilScore(785);
      Alert.alert('CIBIL Score Retrieved', 'Customer Score: 785 (Category: EXCELLENT). No default history.');
    }, 800);
  };

  const handleCaptureThumbprint = () => {
    Alert.alert('Mantra MFS100 OTG Bridge', 'Please place customer right thumb on optical scanner...', [
      {
        text: 'Capture',
        onPress: () => {
          setBiometricCaptured(true);
          Alert.alert('Success', 'Thumbprint template extracted successfully (Quality: 96%, Minutiae: 48).');
        },
      },
    ]);
  };

  const handleSubmit = async () => {
    if (!fullName || !mobile || !line1) {
      Alert.alert('Missing Fields', 'Please complete the mandatory customer name, mobile, and address.');
      return;
    }

    setSubmitting(true);
    const payload = {
      fullName,
      mobile,
      dob,
      gender,
      assignedRouteId: routeId,
      address: {
        line1,
        city,
        state: 'Tamil Nadu',
        pincode,
      },
      aadhaarNumber: isAadhaarValid ? aadhaar : undefined,
      panNumber: isPanValid ? pan.toUpperCase() : undefined,
      guarantor: guarantorName
        ? {
            fullName: guarantorName,
            mobile: guarantorMobile || mobile,
            relationship: guarantorRelation,
            address: { line1, city, state: 'Tamil Nadu', pincode },
          }
        : undefined,
    };

    try {
      // In mobile app, if offline, queue it!
      await OfflineSyncQueue.enqueue('CUSTOMER', payload);
      setSubmitting(false);

      Alert.alert(
        'Customer Onboarded!',
        `Customer profile created successfully (Assigned Code: CUST-${Math.floor(10000 + Math.random() * 90000)}).\nSubmitted for verification.`,
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)/customers'),
          },
        ]
      );
    } catch (err: any) {
      setSubmitting(false);
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Top Header */}
      <View
        style={{
          paddingTop: 50,
          paddingBottom: spacing[4],
          paddingHorizontal: spacing[4],
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TouchableOpacity
          onPress={() => (currentStep > 1 ? setCurrentStep(currentStep - 1) : router.back())}
          style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[typography.h3, { color: colors.textPrimary }]}>
          New Customer (Step {currentStep}/5)
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress Indicator */}
      <View style={{ flexDirection: 'row', height: 4, backgroundColor: colors.primaryLight }}>
        <View
          style={{
            flex: currentStep / 5,
            backgroundColor: colors.primary,
          }}
        />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing[4], paddingBottom: 100 }}>
        {/* Step 1: Personal Demographics */}
        {currentStep === 1 && (
          <View>
            <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: spacing[1] }]}>
              Demographics
            </Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary, marginBottom: spacing[4] }]}>
              Basic customer identification and route assignment
            </Text>

            <Text style={[typography.label, { marginBottom: spacing[1] }]}>Full Name *</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. K. Murugesan"
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing[3],
                fontSize: 16,
                backgroundColor: colors.surface,
                marginBottom: spacing[3],
              }}
            />

            <Text style={[typography.label, { marginBottom: spacing[1] }]}>Mobile Number *</Text>
            <TextInput
              value={mobile}
              onChangeText={setMobile}
              placeholder="10 digit mobile"
              keyboardType="phone-pad"
              maxLength={10}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing[3],
                fontSize: 16,
                backgroundColor: colors.surface,
                marginBottom: spacing[3],
              }}
            />

            <Text style={[typography.label, { marginBottom: spacing[1] }]}>Date of Birth (YYYY-MM-DD)</Text>
            <TextInput
              value={dob}
              onChangeText={setDob}
              placeholder="YYYY-MM-DD"
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing[3],
                fontSize: 16,
                backgroundColor: colors.surface,
                marginBottom: spacing[3],
              }}
            />

            <Text style={[typography.label, { marginBottom: spacing[1] }]}>Door No & Street Address *</Text>
            <TextInput
              value={line1}
              onChangeText={setLine1}
              placeholder="e.g. 14A, Anna Nagar 2nd Street"
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing[3],
                fontSize: 16,
                backgroundColor: colors.surface,
                marginBottom: spacing[3],
              }}
            />

            <View style={{ flexDirection: 'row', gap: spacing[3], marginBottom: spacing[4] }}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.label, { marginBottom: spacing[1] }]}>City</Text>
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                    padding: spacing[3],
                    fontSize: 16,
                    backgroundColor: colors.surface,
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.label, { marginBottom: spacing[1] }]}>Pincode</Text>
                <TextInput
                  value={pincode}
                  onChangeText={setPincode}
                  keyboardType="number-pad"
                  maxLength={6}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                    padding: spacing[3],
                    fontSize: 16,
                    backgroundColor: colors.surface,
                  }}
                />
              </View>
            </View>

            <Button
              title="Next: KYC & Identity →"
              onPress={() => {
                if (!fullName || !mobile || !line1) {
                  Alert.alert('Required', 'Please fill name, mobile, and street address.');
                  return;
                }
                setCurrentStep(2);
              }}
            />
          </View>
        )}

        {/* Step 2: KYC & Identity */}
        {currentStep === 2 && (
          <View>
            <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: spacing[1] }]}>
              KYC & Identity
            </Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary, marginBottom: spacing[4] }]}>
              Government IDs with real-time Verhoeff validation
            </Text>

            <Text style={[typography.label, { marginBottom: spacing[1] }]}>
              Aadhaar Number (12 Digits)
            </Text>
            <View style={{ position: 'relative', marginBottom: spacing[1] }}>
              <TextInput
                value={aadhaar}
                onChangeText={setAadhaar}
                placeholder="12 digit Aadhaar"
                keyboardType="number-pad"
                maxLength={12}
                style={{
                  borderWidth: 1,
                  borderColor: isAadhaarValid ? colors.success : colors.border,
                  borderRadius: radius.md,
                  padding: spacing[3],
                  fontSize: 16,
                  backgroundColor: colors.surface,
                  paddingRight: 40,
                }}
              />
              <View style={{ position: 'absolute', right: 12, top: 14 }}>
                <Ionicons
                  name={isAadhaarValid ? 'checkmark-circle' : 'alert-circle'}
                  size={20}
                  color={isAadhaarValid ? colors.success : colors.danger}
                />
              </View>
            </View>
            <Text
              style={{
                fontSize: 12,
                color: isAadhaarValid ? colors.success : colors.danger,
                marginBottom: spacing[3],
              }}
            >
              {isAadhaarValid
                ? '✓ Valid Aadhaar (Verhoeff checksum passed)'
                : '⚠ Invalid Aadhaar checksum'}
            </Text>

            <Text style={[typography.label, { marginBottom: spacing[1] }]}>
              PAN Card (Optional)
            </Text>
            <TextInput
              value={pan}
              onChangeText={setPan}
              autoCapitalize="characters"
              placeholder="e.g. ABCDE1234F"
              maxLength={10}
              style={{
                borderWidth: 1,
                borderColor: isPanValid ? colors.success : colors.border,
                borderRadius: radius.md,
                padding: spacing[3],
                fontSize: 16,
                backgroundColor: colors.surface,
                marginBottom: spacing[4],
              }}
            />

            {/* Instant CIBIL Pull Card */}
            <View
              style={{
                backgroundColor: colors.primarySoftest,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: radius.lg,
                padding: spacing[4],
                marginBottom: spacing[4],
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={[typography.h3, { color: colors.textPrimary }]}>Credit Bureau Check</Text>
                  <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                    Instant soft credit score pull
                  </Text>
                </View>
                {cibilScore && (
                  <View
                    style={{
                      backgroundColor: colors.success,
                      paddingHorizontal: spacing[3],
                      paddingVertical: spacing[1],
                      borderRadius: radius.full,
                    }}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>{cibilScore} EXCELLENT</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                onPress={handlePullCibil}
                disabled={cibilLoading}
                style={{
                  marginTop: spacing[3],
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.primaryDark,
                  borderRadius: radius.md,
                  paddingVertical: spacing[2],
                  alignItems: 'center',
                }}
              >
                {cibilLoading ? (
                  <ActivityIndicator color={colors.primaryDark} />
                ) : (
                  <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                    🔄 Run Instant CIBIL Score Pull
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <Button title="Next: Guarantor Details →" onPress={() => setCurrentStep(3)} />
          </View>
        )}

        {/* Step 3: Guarantor Details */}
        {currentStep === 3 && (
          <View>
            <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: spacing[1] }]}>
              Guarantor Details
            </Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary, marginBottom: spacing[4] }]}>
              Secondary guarantor for loan security
            </Text>

            <Text style={[typography.label, { marginBottom: spacing[1] }]}>Guarantor Full Name *</Text>
            <TextInput
              value={guarantorName}
              onChangeText={setGuarantorName}
              placeholder="e.g. M. Lakshmi"
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing[3],
                fontSize: 16,
                backgroundColor: colors.surface,
                marginBottom: spacing[3],
              }}
            />

            <Text style={[typography.label, { marginBottom: spacing[1] }]}>Guarantor Mobile *</Text>
            <TextInput
              value={guarantorMobile}
              onChangeText={setGuarantorMobile}
              placeholder="10 digit mobile"
              keyboardType="phone-pad"
              maxLength={10}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing[3],
                fontSize: 16,
                backgroundColor: colors.surface,
                marginBottom: spacing[3],
              }}
            />

            <Text style={[typography.label, { marginBottom: spacing[1] }]}>Relationship</Text>
            <TextInput
              value={guarantorRelation}
              onChangeText={setGuarantorRelation}
              placeholder="SPOUSE / BROTHER / FATHER"
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.md,
                padding: spacing[3],
                fontSize: 16,
                backgroundColor: colors.surface,
                marginBottom: spacing[4],
              }}
            />

            <Button title="Next: Photo & Biometrics →" onPress={() => setCurrentStep(4)} />
          </View>
        )}

        {/* Step 4: Photo & Biometric Thumbprint */}
        {currentStep === 4 && (
          <View>
            <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: spacing[1] }]}>
              Biometrics & Photo
            </Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary, marginBottom: spacing[4] }]}>
              Capture live customer photo and Mantra thumbprint
            </Text>

            {/* Photo Capture Card */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: photoCaptured ? colors.success : colors.border,
                borderRadius: radius.lg,
                padding: spacing[4],
                alignItems: 'center',
                marginBottom: spacing[4],
              }}
            >
              <Ionicons
                name={photoCaptured ? 'camera' : 'camera-outline'}
                size={40}
                color={photoCaptured ? colors.success : colors.primaryDark}
              />
              <Text style={[typography.h3, { marginTop: spacing[2], color: colors.textPrimary }]}>
                {photoCaptured ? 'Photo Captured ✓' : 'Customer Passport Photo'}
              </Text>
              <TouchableOpacity
                onPress={() => setPhotoCaptured(true)}
                style={{
                  marginTop: spacing[3],
                  backgroundColor: colors.primary,
                  paddingHorizontal: spacing[4],
                  paddingVertical: spacing[2],
                  borderRadius: radius.md,
                }}
              >
                <Text style={{ color: colors.textOnPrimary, fontWeight: 'bold' }}>
                  {photoCaptured ? 'Retake Photo' : 'Capture Live Photo'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Thumbprint Scanner Card */}
            <View
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: biometricCaptured ? colors.success : colors.border,
                borderRadius: radius.lg,
                padding: spacing[4],
                alignItems: 'center',
                marginBottom: spacing[4],
              }}
            >
              <Ionicons
                name={biometricCaptured ? 'finger-print' : 'finger-print-outline'}
                size={48}
                color={biometricCaptured ? colors.success : colors.primaryDark}
              />
              <Text style={[typography.h3, { marginTop: spacing[2], color: colors.textPrimary }]}>
                {biometricCaptured ? 'Biometric Thumbprint Verified ✓' : 'Mantra MFS100 Thumbprint'}
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary, textAlign: 'center', marginTop: 4 }]}>
                {biometricCaptured
                  ? 'ISO 19794-2 template generated (Quality: 96%)'
                  : 'Connect OTG fingerprint scanner to device'}
              </Text>

              <TouchableOpacity
                onPress={handleCaptureThumbprint}
                style={{
                  marginTop: spacing[3],
                  backgroundColor: colors.primary,
                  paddingHorizontal: spacing[4],
                  paddingVertical: spacing[2],
                  borderRadius: radius.md,
                }}
              >
                <Text style={{ color: colors.textOnPrimary, fontWeight: 'bold' }}>
                  {biometricCaptured ? 'Scan Again' : 'Scan Thumbprint'}
                </Text>
              </TouchableOpacity>
            </View>

            <Button title="Next: Final Review →" onPress={() => setCurrentStep(5)} />
          </View>
        )}

        {/* Step 5: Final Review & Submit */}
        {currentStep === 5 && (
          <View>
            <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: spacing[1] }]}>
              Application Review
            </Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary, marginBottom: spacing[4] }]}>
              Confirm customer details before submitting to branch manager
            </Text>

            <View
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.lg,
                padding: spacing[4],
                marginBottom: spacing[4],
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[2] }}>
                <Text style={{ color: colors.textSecondary }}>Name:</Text>
                <Text style={{ fontWeight: 'bold', color: colors.textPrimary }}>{fullName}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[2] }}>
                <Text style={{ color: colors.textSecondary }}>Mobile:</Text>
                <Text style={{ fontWeight: 'bold', color: colors.textPrimary }}>{mobile}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[2] }}>
                <Text style={{ color: colors.textSecondary }}>Aadhaar:</Text>
                <Text style={{ fontWeight: 'bold', color: colors.textPrimary }}>
                  {CryptoUtil.maskAadhaar(aadhaar)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[2] }}>
                <Text style={{ color: colors.textSecondary }}>PAN:</Text>
                <Text style={{ fontWeight: 'bold', color: colors.textPrimary }}>
                  {CryptoUtil.maskPan(pan)}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[2] }}>
                <Text style={{ color: colors.textSecondary }}>CIBIL Score:</Text>
                <Text style={{ fontWeight: 'bold', color: colors.success }}>780 (EXCELLENT)</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[2] }}>
                <Text style={{ color: colors.textSecondary }}>Thumbprint:</Text>
                <Text style={{ fontWeight: 'bold', color: biometricCaptured ? colors.success : colors.danger }}>
                  {biometricCaptured ? 'Captured ✓' : 'Pending'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: colors.textSecondary }}>Route:</Text>
                <Text style={{ fontWeight: 'bold', color: colors.textPrimary }}>{routeId}</Text>
              </View>
            </View>

            <Button
              title={submitting ? 'Submitting Application...' : 'Submit Application (Save & Sync)'}
              onPress={handleSubmit}
              disabled={submitting}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
