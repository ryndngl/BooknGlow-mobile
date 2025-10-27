import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.lastUpdated}>Last Updated: January 2025</Text>

          <Text style={styles.introText}>
            At Van's Glow up Salon, we are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our mobile application and services.
          </Text>

          {/* Section 1 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Information We Collect</Text>
            
            <Text style={styles.subsectionTitle}>Personal Information:</Text>
            <Text style={styles.sectionContent}>
              • Full name and contact details (phone, email)
              {"\n"}• Profile photo (optional)
              {"\n"}• Service preferences and history
            </Text>
          </View>

          {/* Section 2 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
            <Text style={styles.sectionContent}>
              <Text style={styles.boldText}>Service Delivery:</Text>
              {"\n"}• Process and manage your appointments
              {"\n"}• Send booking confirmations and reminders
              {"\n"}• Process payments and maintain records
              {"\n\n"}
              <Text style={styles.boldText}>Communication:</Text>
              {"\n"}• Send promotional offers and updates (with consent)
              {"\n"}• Notify about service changes or app updates
              {"\n"}• Respond to your inquiries and feedback
              {"\n\n"}
              <Text style={styles.boldText}>Improvement:</Text>
              {"\n"}• Analyze app usage to improve features
              {"\n"}• Personalize your experience
              {"\n"}• Develop new services and features
            </Text>
          </View>

          {/* Section 3 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Data Security</Text>
            <Text style={styles.sectionContent}>
              We implement industry-standard security measures to protect your information:
              {"\n\n"}
              • Encrypted data transmission (SSL/TLS)
              {"\n"}• Secure database storage
              {"\n"}• Regular security audits and updates
              {"\n"}• Access controls and staff training
              {"\n"}• Two-factor authentication options
              {"\n\n"}
              However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security but continuously work to protect your data.
            </Text>
          </View>

          {/* Section 4 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Data Retention</Text>
            <Text style={styles.sectionContent}>
              <Text style={styles.boldText}>Account Data:</Text> Retained while your account is active
              {"\n"}
              <Text style={styles.boldText}>Booking History:</Text> Kept for 3 years for service and tax purposes
              {"\n"}
              <Text style={styles.boldText}>Payment Records:</Text> Retained for 7 years as required by law
              {"\n"}
              <Text style={styles.boldText}>Marketing Data:</Text> Until you unsubscribe or object
              {"\n\n"}
              When you delete your account, we will remove or anonymize your personal data within 30 days, except where retention is required by law.
            </Text>
          </View>

          {/* Section 5 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Contact Us</Text>
            <Text style={styles.sectionContent}>
              For questions about this Privacy Policy or your personal data:
              {"\n\n"}
              <Text style={styles.boldText}>Data Protection Officer:</Text>
              {"\n"}Email: vansglowupsalon2k25@gmail.com
              {"\n"}Phone: +63 956 411 7744
              {"\n\n"}
              <Text style={styles.boldText}>Mailing Address:</Text>
              {"\n"}Van's Glow up Salon - Privacy Department
              {"\n"}Blk 7 Lot 2 Phase 1 SuB Urban Village, 
              {"\n"}Brgy. San Jose Rodriguez Rizal, Philippines
              {"\n\n"}
              <Text style={styles.boldText}>Regulatory Authority:</Text>
              {"\n"}You may also file complaints with the National Privacy Commission of the Philippines.
            </Text>
          </View>

          {/* Consent Section */}
          <View style={styles.consentSection}>
            <Text style={styles.consentTitle}>Your Consent</Text>
            <Text style={styles.consentText}>
              By using Van's Glow up Salon mobile application, you consent to the collection, use, and processing of your personal information as described in this Privacy Policy.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginTop: 55,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 20,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  introText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 24,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 6,
  },
  sectionContent: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    marginBottom: 8,
  },
  boldText: {
    fontWeight: '600',
    color: '#333',
  },
  consentSection: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
    marginTop: 10,
  },
  consentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1976d2',
    marginBottom: 8,
    textAlign: 'center',
  },
  consentText: {
    fontSize: 16,
    color: '#1976d2',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
  },
});