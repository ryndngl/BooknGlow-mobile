import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet
} from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function FAQScreen({ navigation }) {
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpanded = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
 
  const faqData = [
    {
      category: "Booking & Appointments",
      questions: [
        {
          question: "How do I book an appointment?",
          answer: "You can book an appointment through our app in 3 easy steps:\n\n1. Browse our services and select your preferred treatment\n2. Choose your preferred service and style and available time slot\n3. Confirm your booking"
        },
        {
          question: "Can I cancel my appointment?",
          answer: "Yes! You can cancel your appointment up to 24 hours before your scheduled time:\n\n• Go to 'My Bookings' in the app\n• Select the appointment you want to cancel."
        },
        {
          question: "What if I'm running late?",
          answer: "Please call the salon immediately if you're running late. We can hold your appointment for up to 15 minutes. If you're more than 15 minutes late, we may need to accommodate other clients."
        },
        {
          question: "Can I book multiple services at once?",
          answer: "Absolutely! You can add multiple services to your booking:\n\n• Select your first service\n• Tap 'Add Another Service' before checkout\n• Choose additional treatments\n\nThe app will automatically calculate the total time and price for your combined services."
        }
      ]
    },
    {
      category: "Payments & Pricing",
      questions: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept various payment methods:\n\n• GCash (recommended for faster checkout)\n• Cash payment at the salon."
        },
        {
          question: "Do you offer discounts or promotions?",
          answer: "Yes! We offer promotions:\n• Loyalty Cards program\n• Package deals for multiple services\n\nEnable notifications in the app to receive exclusive offers and promo codes."
        },
      ]
    },
    {
      category: "Services & Style",
      questions: [
        {
          question: "How long do different services take?",
          answer: "Service durations vary by treatment:\n\n• Hair Cut: 30-45 minutes\n• Hair Color: 2-3 hours\n• Rebond: 3-4 hours\n• Manicure: 45-60 minutes\n• Pedicure: 60-75 minutes\n"
        },
        {
          question: "What should I bring to my appointment?",
          answer: "For most appointments, just bring:\n\n• Your booking confirmation\n• Payment method (if paying at salon)\n• Any inspiration photos for your desired look\n\nFor specific treatments like chemical services, avoid washing your hair 24-48 hours prior."
        },
        {
           question: "Can I customize my service or style?",
           answer: "Yes! Many of our services allow customization.\nFor example, you can choose specific haircut styles, add nail art designs, or request adjustments for treatments. Options and prices are shown when you select the service in the app."
        },
      ]
    },
    {
      category: "Account & App Issues",
      questions: [
        {
          question: "How do I create an account?",
          answer: "Creating an account is quick and easy:\n\n1. Download our Mobile app from the Website\n2. Tap 'Register Here' and enter your details\n3. Type your email address to receive a email incase you forgot your password\n4. Complete your profile with preferences.\n"
        },
        {
          question: "I forgot my password. How do I reset it?",
          answer: "To reset your password:\n\n1. Go to the login screen\n2. Tap 'Forgot Password?'\n3. Enter your email address\n4. Check your email for reset instructions\n5. Create your new password\n\nIf you don't receive the email, check your spam folder."
        },
        {
          question: "How do I update my profile information?",
          answer: "You can update your profile anytime:\n\n• Go to 'My Profile' in the app\n• Tap 'Edit Profile'\n• Update your information\n• Save changes\n\nKeep your contact info current to receive booking confirmations and reminders."
        },
        {
          question: "The app isn't working properly. What should I do?",
          answer: "Try these troubleshooting steps:\n\n1. Force close and restart the app\n2. Check your internet connection\n3. Update to the latest app version\n4. Restart your phone\n5. Clear app cache\n\nIf issues persist, contact our support team through 'Contact Us' in the app."
        }
      ]
    },

  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Frequently Asked Questions</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {faqData.map((category, categoryIndex) => (
          <View key={categoryIndex} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category.category}</Text>
            
            {category.questions.map((item, questionIndex) => {
              const itemKey = `${categoryIndex}-${questionIndex}`;
              const isExpanded = expandedItems[itemKey];
              
              return (
                <View key={questionIndex} style={styles.faqItem}>
                  <TouchableOpacity
                    style={styles.questionContainer}
                    onPress={() => toggleExpanded(itemKey)}
                  >
                    <Text style={styles.questionText}>{item.question}</Text>
                    <Icon 
                      name={isExpanded ? "expand-less" : "expand-more"} 
                      size={24} 
                      color="#666" 
                    />
                  </TouchableOpacity>
                  
                  {isExpanded && (
                    <View style={styles.answerContainer}>
                      <Text style={styles.answerText}>{item.answer}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}

        {/* Still have questions section */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Still have questions?</Text>
          <Text style={styles.contactText}>
            Can't find what you're looking for? Our support team is here to help!
          </Text>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={() => navigation.navigate('ContactUs')}
          >
            <Icon name="chat" size={20} color="#fff" />
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
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
    paddingHorizontal: 16,
  },
  categorySection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 16,
    overflow: 'hidden',
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#4CAF50',
    color: '#fff',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  answerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#fafafa',
  },
  answerText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  contactSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginTop: 20,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});