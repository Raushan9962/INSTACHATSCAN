import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

// Mock components for demonstration
const Button = ({ children, className = '', disabled, type, variant, size, onClick, ...props }) => (
  <button
    className={`px-4 py-2 rounded-md font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
      disabled 
        ? 'bg-gray-300 text-gray-500 cursor-not-allowed transform-none' 
        : variant === 'ghost' 
          ? 'hover:bg-gray-100 text-gray-600' 
          : 'bg-green-800 text-white hover:bg-green-900 shadow-lg hover:shadow-xl'
    } ${className}`}
    disabled={disabled}
    type={type}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden transition-all duration-500 hover:shadow-3xl ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 pb-4 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }) => (
  <h2 className={`text-2xl font-bold text-gray-900 ${className}`}>
    {children}
  </h2>
);

const CardDescription = ({ children, className = '' }) => (
  <p className={`text-gray-600 mt-2 ${className}`}>
    {children}
  </p>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 pt-2 ${className}`}>
    {children}
  </div>
);

const Input = ({ className = '', type, ...props }) => (
  <input
    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent transition-all duration-200 ${className}`}
    type={type}
    {...props}
  />
);

const Label = ({ children, htmlFor, className = '' }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}>
    {children}
  </label>
);

// Mock hooks for demonstration
const useAuth = () => ({
  register: async (name, email, password) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (email === 'test@example.com') {
      return { success: false, message: 'Email already exists' };
    }
    return { success: true };
  }
});

const useForm = () => {
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({});

  return {
    register: (name, validation) => ({
      name,
      onChange: (e) => {
        setFormData(prev => ({ ...prev, [name]: e.target.value }));
        if (errors[name]) {
          setErrors(prev => ({ ...prev, [name]: null }));
        }
      },
      onBlur: (e) => {
        const value = e.target.value;
        if (validation?.required && !value) {
          setErrors(prev => ({ ...prev, [name]: { message: validation.required } }));
        } else if (validation?.pattern && !validation.pattern.value.test(value)) {
          setErrors(prev => ({ ...prev, [name]: { message: validation.pattern.message } }));
        } else if (validation?.minLength && value.length < validation.minLength.value) {
          setErrors(prev => ({ ...prev, [name]: { message: validation.minLength.message } }));
        } else if (validation?.validate) {
          const result = validation.validate(value);
          if (result !== true) {
            setErrors(prev => ({ ...prev, [name]: { message: result } }));
          }
        }
      }
    }),
    handleSubmit: (onSubmit) => (e) => {
      e.preventDefault();
      onSubmit(formData);
    },
    formState: { errors },
    setError: (field, error) => setErrors(prev => ({ ...prev, [field]: error })),
    watch: (field) => formData[field] || ''
  };
};

const Link = ({ to, children, className = '', state }) => (
  <a href={to} className={className}>
    {children}
  </a>
);

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch
  } = useForm();

  const password = watch('password');

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setFormVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (password) {
      let strength = 0;
      if (password.length >= 6) strength++;
      if (/[a-z]/.test(password)) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/\d/.test(password)) strength++;
      if (/[!@#$%^&*]/.test(password)) strength++;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [password]);

  const from = '/dashboard';

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      const result = await registerUser(data.name, data.email, data.password);
      
      if (result.success) {
        console.log('Registration successful! Redirecting to:', from);
      } else {
        setError('root', { message: result.message });
      }
    } catch (error) {
      setError('root', { message: 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-green-600';
    return 'bg-green-800';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 2) return 'Fair';
    if (passwordStrength <= 3) return 'Good';
    if (passwordStrength <= 4) return 'Strong';
    return 'Very Strong';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 px-4">
      <div 
        className={`transition-all duration-700 transform ${
          mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        <Card className="w-full max-w-md backdrop-blur-sm bg-white/95">
          <CardHeader className="text-center">
            <CardTitle className={`text-2xl flex items-center justify-center space-x-2 transition-all duration-500 ${
              formVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
            }`}>
              <UserPlus className="h-6 w-6 text-green-800 animate-pulse" />
              <span className="bg-gradient-to-r from-green-800 to-green-600 bg-clip-text text-transparent">
                Create Account
              </span>
            </CardTitle>
            <CardDescription className={`transition-all duration-500 delay-100 ${
              formVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
            }`}>
              Sign up to start shopping with us
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Full Name Field */}
              <div className={`space-y-2 transition-all duration-500 delay-200 ${
                formVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  className="transform transition-all duration-200 focus:scale-105 hover:shadow-md"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters'
                    }
                  })}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 animate-bounce">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className={`space-y-2 transition-all duration-500 delay-300 ${
                formVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
              }`}>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="transform transition-all duration-200 focus:scale-105 hover:shadow-md"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 animate-bounce">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className={`space-y-2 transition-all duration-500 delay-400 ${
                formVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
              }`}>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    className="transform transition-all duration-200 focus:scale-105 hover:shadow-md pr-12"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                      }
                    })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-full transition-all duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <div className="transition-transform duration-200">
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </Button>
                </div>
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-1 animate-fade-in">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Password Strength:</span>
                      <span className={`font-medium ${passwordStrength >= 4 ? 'text-green-700' : 'text-gray-600'}`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {errors.password && (
                  <p className="text-sm text-red-500 animate-bounce">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className={`space-y-2 transition-all duration-500 delay-500 ${
                formVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
              }`}>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    className="transform transition-all duration-200 focus:scale-105 hover:shadow-md pr-12"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: value =>
                        value === password || 'Passwords do not match'
                    })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-full transition-all duration-200"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <div className="transition-transform duration-200">
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500 animate-bounce">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {errors.root && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 animate-shake">
                  {errors.root.message}
                </div>
              )}

              <div className={`transition-all duration-500 delay-600 ${
                formVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}>
                <Button 
                  type="submit" 
                  className={`w-full relative overflow-hidden ${
                    loading ? 'cursor-not-allowed' : ''
                  }`}
                  disabled={loading}
                  onClick={handleSubmit(onSubmit)}
                >
                  <span className={`transition-all duration-300 ${
                    loading ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'
                  }`}>
                    Create Account
                  </span>
                  {loading && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </span>
                  )}
                </Button>
              </div>
            </div>

            <div className={`mt-6 text-center transition-all duration-500 delay-700 ${
              formVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-green-800 hover:text-green-900 font-medium transition-all duration-200 hover:underline transform hover:scale-105 inline-block"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <div className={`mt-6 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200 transition-all duration-500 delay-800 hover:shadow-lg ${
              formVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              <p className="text-xs text-gray-700">
                By creating an account, you agree to our{' '}
                <a href="/terms" className="text-green-800 hover:text-green-900 underline">terms of service</a>
                {' '}and{' '}
                <a href="/privacy" className="text-green-800 hover:text-green-900 underline">privacy policy</a>.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Register;