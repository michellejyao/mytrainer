import React, { useState } from 'react';
import { auth, googleProvider } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #ffffff 0%, #fdf5e6 30%, #ffa500 100%);
  font-family: 'Playfair Display', serif;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  padding: 3rem 3.5rem;
  border-radius: 2rem;
  box-shadow: 0 10px 40px rgba(255, 165, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 380px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 165, 0, 0.1);
`;

const Title = styled.h2`
  color: #000000;
  margin-bottom: 0.5rem;
  font-size: 2.5rem;
  font-weight: 300;
  text-align: center;
  font-family: 'Playfair Display', serif;
`;

const Input = styled.input`
  padding: 1rem 1.2rem;
  border-radius: 1rem;
  border: 2px solid rgba(255, 165, 0, 0.2);
  background: #ffffff;
  font-size: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #ffa500;
    box-shadow: 0 0 0 3px rgba(255, 165, 0, 0.1);
  }
  
  &::placeholder {
    color: #999;
  }
`;

const Button = styled.button`
  background: #ffa500;
  color: #000000;
  border: none;
  border-radius: 1rem;
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: all 0.3s ease;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  box-shadow: 0 4px 15px rgba(255, 165, 0, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 165, 0, 0.4);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const GoogleButton = styled(Button)`
  background: #ffffff;
  color: #000000;
  border: 2px solid #ffa500;
  
  &:hover {
    background: #ffa500;
    color: #000000;
  }
`;

const Switch = styled.p`
  color: #000000;
  cursor: pointer;
  text-align: center;
  margin: 0;
  font-size: 1rem;
  transition: color 0.3s ease;
  
  &:hover {
    color: #ffa500;
  }
`;

const ErrorMsg = styled.div`
  color: #e57373;
  font-size: 0.95rem;
  text-align: center;
  background: rgba(229, 115, 115, 0.1);
  padding: 0.8rem;
  border-radius: 0.8rem;
  border: 1px solid rgba(229, 115, 115, 0.2);
`;

const AnimatedCard = styled(Card)`
  animation: slideInUp 0.6s ease-out;
  
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export default function AuthPage({ onAuth }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onAuth();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      onAuth();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container>
      <AnimatedCard>
        <Title>{isSignUp ? 'Sign Up' : 'Log In'}</Title>
        <form onSubmit={handleAuth}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <Button type="submit">{isSignUp ? 'Sign Up' : 'Log In'}</Button>
        </form>
        <GoogleButton onClick={handleGoogle}>Continue with Google</GoogleButton>
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <Switch onClick={() => setIsSignUp(s => !s)}>
          {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
        </Switch>
      </AnimatedCard>
    </Container>
  );
} 