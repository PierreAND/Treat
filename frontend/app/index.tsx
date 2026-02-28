
import React, { useState } from 'react';
import { LoginScreen } from '../src/ui/screens/LoginScreen';
import { RegisterScreen } from '../src/ui/screens/RegisterScreen';
import { useAuth } from '../src/presentation/hooks/useAuth';

export default function Index() {
  const [screen, setScreen] = useState<'login' | 'register'>('login');
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {

    return null;
  }

  if (screen === 'register') {
    return <RegisterScreen onNavigateToLogin={() => setScreen('login')} />;
  }

  return <LoginScreen onNavigateToRegister={() => setScreen('register')} />;
}