import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'; // CORRECT import for SafeAreaView
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { auth } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// --- Reusable UI Components ---
const FormInput = ({ label, value, onChangeText, placeholder, secureTextEntry = false }) => (
    <View style={styles.inputContainer}>
        {label && <Text style={styles.label}>{label}</Text>}
        <TextInput style={styles.input} value={value} onChangeText={onChangeText} placeholder={placeholder} secureTextEntry={secureTextEntry} autoCapitalize="none" placeholderTextColor="#999"/>
    </View>
);
const FormButton = ({ text, onPress, loading }) => (
    <TouchableOpacity style={styles.button} onPress={onPress} disabled={loading}>{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{text}</Text>}</TouchableOpacity>
);
const LoadingScreen = () => <View style={styles.screenContainer}><ActivityIndicator size="large" color="#435EBE" /></View>;


// --- Authentication Screens ---
function WelcomeScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.authContainer}>
            <Text style={styles.title}>CampusLedger</Text>
            <Text style={styles.subtitle}>Your Digital Academic Portfolio</Text>
            <FormButton text="Login" onPress={() => navigation.navigate('Login')} />
            <FormButton text="Sign Up" onPress={() => navigation.navigate('SignUp')} />
        </SafeAreaView>
    );
}

function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true); setError('');
        try {
            // CORRECT Firebase v9 syntax
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            setError("Invalid credentials. Please try again.");
        }
        setLoading(false);
    };

    return (
        <SafeAreaView style={styles.authContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <FormInput label="Email" value={email} onChangeText={setEmail} placeholder="you@email.com" />
            <FormInput label="Password" value={password} onChangeText={setPassword} placeholder="Your password" secureTextEntry />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <FormButton text="Login" onPress={handleLogin} loading={loading} />
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}><Text style={styles.switchText}>Don't have an account? Sign Up</Text></TouchableOpacity>
        </SafeAreaView>
    );
}

function SignUpScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignUp = async () => {
        setLoading(true); setError('');
        try {
            // CORRECT Firebase v9 syntax
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (err) {
            setError("Could not create account. Email may be in use or password is too weak.");
        }
        setLoading(false);
    };

    return (
        <SafeAreaView style={styles.authContainer}>
            <Text style={styles.title}>Create Account</Text>
            <FormInput label="Email" value={email} onChangeText={setEmail} placeholder="you@email.com" />
            <FormInput label="Password" value={password} onChangeText={setPassword} placeholder="Choose a strong password" secureTextEntry />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <FormButton text="Sign Up" onPress={handleSignUp} loading={loading} />
            <TouchableOpacity onPress={() => navigation.navigate('Login')}><Text style={styles.switchText}>Already have an account? Login</Text></TouchableOpacity>
        </SafeAreaView>
    );
}

// --- Placeholder Dashboard Screens ---
const DashboardScreen = () => <SafeAreaView style={styles.screenContainer}><Text>Dashboard Screen</Text></SafeAreaView>;
const PortfolioScreen = () => <SafeAreaView style={styles.screenContainer}><Text>Portfolio Screen</Text></SafeAreaView>;
const ActivitiesScreen = () => <SafeAreaView style={styles.screenContainer}><Text>My Activities Screen</Text></SafeAreaView>;
function SettingsScreen() {
    const handleLogout = () => signOut(auth);
    return (
        <SafeAreaView style={styles.screenContainer}>
            <Text>Settings Screen</Text>
            <View style={{marginTop: 20}}><FormButton text="Logout" onPress={handleLogout} /></View>
        </SafeAreaView>
    );
};

// --- Navigators ---
function AuthNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
        </Stack.Navigator>
    );
}

function MainAppNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
                    else if (route.name === 'Portfolio') iconName = focused ? 'person-circle' : 'person-circle-outline';
                    else if (route.name === 'Activities') iconName = focused ? 'list' : 'list-outline';
                    else if (route.name === 'Settings') iconName = focused ? 'settings' : 'settings-outline';
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#F26419',
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
            })}
        >
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Portfolio" component={PortfolioScreen} />
            <Tab.Screen name="Activities" component={ActivitiesScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
}

// --- Main App Component ---
export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <SafeAreaProvider>
            <StatusBar barStyle="dark-content" />
            <NavigationContainer>
                {user ? <MainAppNavigator /> : <AuthNavigator />}
            </NavigationContainer>
        </SafeAreaProvider>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    screenContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    authContainer: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f7f8fc' },
    title: { fontSize: 32, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: '#333' },
    subtitle: { fontSize: 16, color: '#6c757d', textAlign: 'center', marginBottom: 40 },
    inputContainer: { marginBottom: 16 },
    label: { fontSize: 16, fontWeight: '500', marginBottom: 8, color: '#333' },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 14, fontSize: 16, backgroundColor: '#fff' },
    button: { backgroundColor: '#F26419', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    switchText: { color: '#F26419', textAlign: 'center', marginTop: 20, fontWeight: '500' },
    errorText: { color: 'red', textAlign: 'center', marginBottom: 10 },
});