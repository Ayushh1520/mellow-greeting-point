
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const Auth = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  
  const [signinForm, setSigninForm] = useState({
    email: '',
    password: ''
  });
  
  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  
  const [resetEmail, setResetEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (user && !authLoading) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!signinForm.email) {
      newErrors.signinEmail = 'Email is required';
    } else if (!validateEmail(signinForm.email)) {
      newErrors.signinEmail = 'Please enter a valid email';
    }
    if (!signinForm.password) {
      newErrors.signinPassword = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    console.log('Attempting signin with:', signinForm.email);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signinForm.email.trim(),
        password: signinForm.password,
      });

      if (error) {
        console.error('Signin error:', error);
        let errorMessage = error.message;
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = "Invalid email or password. Please check your credentials and try again.";
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = "Please check your email and click the confirmation link before signing in.";
        }
        
        toast({
          title: "Sign In Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else if (data.user) {
        console.log('Signin successful:', data.user.email);
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });
        // Navigation will be handled by useAuth hook
      }
    } catch (error) {
      console.error('Unexpected signin error:', error);
      toast({
        title: "Sign In Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!signupForm.firstName) {
      newErrors.firstName = 'First name is required';
    }
    if (!signupForm.lastName) {
      newErrors.lastName = 'Last name is required';
    }
    if (!signupForm.email) {
      newErrors.signupEmail = 'Email is required';
    } else if (!validateEmail(signupForm.email)) {
      newErrors.signupEmail = 'Please enter a valid email';
    }
    if (!signupForm.password) {
      newErrors.signupPassword = 'Password is required';
    } else if (signupForm.password.length < 6) {
      newErrors.signupPassword = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    console.log('Attempting signup with:', signupForm.email);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupForm.email.trim(),
        password: signupForm.password,
        options: {
          data: {
            first_name: signupForm.firstName.trim(),
            last_name: signupForm.lastName.trim(),
          },
        },
      });

      if (error) {
        console.error('Signup error:', error);
        let errorMessage = error.message;
        
        if (error.message.includes('User already registered')) {
          errorMessage = "An account with this email already exists. Please sign in instead.";
        }
        
        toast({
          title: "Sign Up Failed",
          description: errorMessage,
          variant: "destructive",
        });
      } else if (data.user) {
        console.log('Signup successful:', data.user.email);
        
        if (data.user && !data.session) {
          toast({
            title: "Account Created!",
            description: "Please check your email for verification before signing in.",
          });
        } else {
          toast({
            title: "Account Created!",
            description: "Welcome! You're now signed in.",
          });
        }
        
        setSignupForm({
          email: '',
          password: '',
          firstName: '',
          lastName: ''
        });
      }
    } catch (error) {
      console.error('Unexpected signup error:', error);
      toast({
        title: "Sign Up Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!resetEmail) {
      setErrors({ resetEmail: 'Email is required' });
      return;
    }

    if (!validateEmail(resetEmail)) {
      setErrors({ resetEmail: 'Please enter a valid email' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim());

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Password reset email sent! Please check your email for instructions.",
        });
        setResetEmail('');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Flipkart</h1>
          <p className="text-gray-600">Your shopping destination</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                <TabsTrigger value="forgot">Reset Password</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={signinForm.email}
                      onChange={(e) => {
                        setSigninForm(prev => ({ ...prev, email: e.target.value }));
                        if (errors.signinEmail) {
                          setErrors(prev => ({ ...prev, signinEmail: '' }));
                        }
                      }}
                      placeholder="Enter your email"
                      disabled={loading}
                      className={errors.signinEmail ? 'border-red-500' : ''}
                    />
                    {errors.signinEmail && (
                      <p className="text-sm text-red-500 mt-1">{errors.signinEmail}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showPassword ? "text" : "password"}
                        value={signinForm.password}
                        onChange={(e) => {
                          setSigninForm(prev => ({ ...prev, password: e.target.value }));
                          if (errors.signinPassword) {
                            setErrors(prev => ({ ...prev, signinPassword: '' }));
                          }
                        }}
                        placeholder="Enter your password"
                        disabled={loading}
                        className={errors.signinPassword ? 'border-red-500 pr-10' : 'pr-10'}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.signinPassword && (
                      <p className="text-sm text-red-500 mt-1">{errors.signinPassword}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first-name">First Name</Label>
                      <Input
                        id="first-name"
                        type="text"
                        value={signupForm.firstName}
                        onChange={(e) => {
                          setSignupForm(prev => ({ ...prev, firstName: e.target.value }));
                          if (errors.firstName) {
                            setErrors(prev => ({ ...prev, firstName: '' }));
                          }
                        }}
                        placeholder="First name"
                        disabled={loading}
                        className={errors.firstName ? 'border-red-500' : ''}
                      />
                      {errors.firstName && (
                        <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input
                        id="last-name"
                        type="text"
                        value={signupForm.lastName}
                        onChange={(e) => {
                          setSignupForm(prev => ({ ...prev, lastName: e.target.value }));
                          if (errors.lastName) {
                            setErrors(prev => ({ ...prev, lastName: '' }));
                          }
                        }}
                        placeholder="Last name"
                        disabled={loading}
                        className={errors.lastName ? 'border-red-500' : ''}
                      />
                      {errors.lastName && (
                        <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={signupForm.email}
                      onChange={(e) => {
                        setSignupForm(prev => ({ ...prev, email: e.target.value }));
                        if (errors.signupEmail) {
                          setErrors(prev => ({ ...prev, signupEmail: '' }));
                        }
                      }}
                      placeholder="Enter your email"
                      disabled={loading}
                      className={errors.signupEmail ? 'border-red-500' : ''}
                    />
                    {errors.signupEmail && (
                      <p className="text-sm text-red-500 mt-1">{errors.signupEmail}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showSignupPassword ? "text" : "password"}
                        value={signupForm.password}
                        onChange={(e) => {
                          setSignupForm(prev => ({ ...prev, password: e.target.value }));
                          if (errors.signupPassword) {
                            setErrors(prev => ({ ...prev, signupPassword: '' }));
                          }
                        }}
                        placeholder="Create a password"
                        disabled={loading}
                        className={errors.signupPassword ? 'border-red-500 pr-10' : 'pr-10'}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        disabled={loading}
                      >
                        {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.signupPassword && (
                      <p className="text-sm text-red-500 mt-1">{errors.signupPassword}</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="forgot">
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => {
                        setResetEmail(e.target.value);
                        if (errors.resetEmail) {
                          setErrors(prev => ({ ...prev, resetEmail: '' }));
                        }
                      }}
                      placeholder="Enter your email address"
                      disabled={loading}
                      className={errors.resetEmail ? 'border-red-500' : ''}
                    />
                    {errors.resetEmail && (
                      <p className="text-sm text-red-500 mt-1">{errors.resetEmail}</p>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Enter your email address and we'll send you a link to reset your password.
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Reset Email...
                      </>
                    ) : (
                      'Send Reset Email'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-700"
          >
            ← Back to Shopping
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
