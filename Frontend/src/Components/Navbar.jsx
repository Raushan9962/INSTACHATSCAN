import React, { useState } from 'react';
import { ShoppingCart, User, Menu, X, Search, Package, LogOut, Settings } from 'lucide-react';

// Mock UI Components
const Button = ({ children, className = '', disabled, type, variant, size, onClick, asChild, ...props }) => {
  const baseClasses = `inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50`;
  
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };
  
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  };
  
  const variantClass = variants[variant] || variants.default;
  const sizeClass = sizes[size] || sizes.default;
  
  if (asChild) {
    return (
      <span className={`${baseClasses} ${variantClass} ${sizeClass} ${className}`} {...props}>
        {children}
      </span>
    );
  }
  
  return (
    <button
      className={`${baseClasses} ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled}
      type={type}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = ({ className = '', type, ...props }) => (
  <input
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    type={type}
    {...props}
  />
);

const Badge = ({ children, className = '', variant = 'default', ...props }) => {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/80',
    outline: 'text-foreground',
  };
  
  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const DropdownMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative inline-block text-left">
      {React.Children.map(children, child =>
        React.cloneElement(child, { isOpen, setIsOpen })
      )}
    </div>
  );
};

const DropdownMenuTrigger = ({ children, asChild, isOpen, setIsOpen }) => (
  <div onClick={() => setIsOpen(!isOpen)}>
    {asChild ? children : <button>{children}</button>}
  </div>
);

const DropdownMenuContent = ({ children, align = 'start', className = '', isOpen, setIsOpen }) => {
  if (!isOpen) return null;
  
  const alignmentClasses = {
    start: 'left-0',
    end: 'right-0',
    center: 'left-1/2 transform -translate-x-1/2',
  };
  
  return (
    <div 
      className={`absolute top-full mt-2 ${alignmentClasses[align]} bg-popover text-popover-foreground shadow-md border rounded-md py-1 z-50 min-w-[8rem] ${className}`}
      onClick={() => setIsOpen(false)}
    >
      {children}
    </div>
  );
};

const DropdownMenuItem = ({ children, asChild, onClick, className = '', ...props }) => {
  const handleClick = (e) => {
    if (onClick) onClick(e);
  };
  
  if (asChild) {
    return React.cloneElement(children, {
      className: `block px-4 py-2 text-sm hover:bg-accent cursor-pointer ${className}`,
      onClick: handleClick,
    });
  }
  
  return (
    <div
      className={`block px-4 py-2 text-sm hover:bg-accent cursor-pointer ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
};

const DropdownMenuSeparator = () => (
  <div className="h-px bg-border my-1" />
);

const Sheet = ({ children, open, onOpenChange }) => {
  return (
    <div>
      {React.Children.map(children, child =>
        React.cloneElement(child, { open, onOpenChange })
      )}
    </div>
  );
};

const SheetTrigger = ({ children, asChild, open, onOpenChange }) => (
  <div onClick={() => onOpenChange(!open)}>
    {asChild ? children : <button>{children}</button>}
  </div>
);

const SheetContent = ({ children, side = 'right', className = '', open, onOpenChange }) => {
  if (!open) return null;
  
  const sideClasses = {
    right: 'right-0 border-l',
    left: 'left-0 border-r',
    top: 'top-0 border-b',
    bottom: 'bottom-0 border-t',
  };
  
  return (
    <>
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
        onClick={() => onOpenChange(false)}
      />
      <div className={`fixed ${sideClasses[side]} z-50 gap-4 bg-background p-6 shadow-lg transition-transform ${className}`}>
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </>
  );
};

const Link = ({ to, children, className = '', onClick, ...props }) => (
  <a href={to} className={className} onClick={onClick} {...props}>
    {children}
  </a>
);

// Mock hooks and context
const useAuth = () => ({
  isAuthenticated: true,
  user: { name: 'John Doe', email: 'john@example.com' },
  isAdmin: true,
  logout: async () => {
    console.log('Logged out');
  }
});

const useCart = () => ({
  getItemCount: () => 3
});

const useLocation = () => ({
  pathname: '/'
});

const useNavigate = () => (path) => {
  console.log('Navigating to:', path);
};

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navigationLinks = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Products' },
  ];

  const userLinks = isAuthenticated ? [
    { path: '/orders', label: 'My Orders', icon: Package },
  ] : [];

  const adminLinks = isAdmin ? [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/products', label: 'Manage Products' },
    { path: '/admin/orders', label: 'Manage Orders' },
  ] : [];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Package className="h-8 w-8 text-green-800" />
            <span className="text-xl font-bold text-gray-900">ShopScanner</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors hover:text-green-800 font-medium ${
                  location.pathname === link.path
                    ? 'text-green-800 border-b-2 border-green-800 pb-1'
                    : 'text-gray-600 hover:text-green-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center space-x-2 flex-1 max-w-md mx-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 focus:ring-2 focus:ring-green-800 focus:border-green-800"
              />
            </div>
            <Button 
              type="submit" 
              size="sm"
              onClick={handleSearch}
              className="bg-green-800 hover:bg-green-900"
            >
              Search
            </Button>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart */}
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="sm" className="relative hover:bg-green-50">
                <ShoppingCart className="h-5 w-5 text-gray-600" />
                {getItemCount() > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                    {getItemCount()}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2 hover:bg-green-50">
                    <User className="h-5 w-5 text-gray-600" />
                    <span className="text-gray-700">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200">
                  {userLinks.map((link) => (
                    <DropdownMenuItem key={link.path} asChild>
                      <Link to={link.path} className="flex items-center space-x-2">
                        <link.icon className="h-4 w-4" />
                        <span>{link.label}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      {adminLinks.map((link) => (
                        <DropdownMenuItem key={link.path} asChild>
                          <Link to={link.path} className="flex items-center space-x-2">
                            <Settings className="h-4 w-4" />
                            <span>{link.label}</span>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild className="hover:bg-green-50">
                  <Link to="/login" className="text-gray-600">Login</Link>
                </Button>
                <Button size="sm" asChild className="bg-green-800 hover:bg-green-900">
                  <Link to="/register" className="text-white">Register</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Cart */}
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5 text-gray-600" />
                {getItemCount() > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500">
                    {getItemCount()}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="hover:bg-green-50">
                  <Menu className="h-5 w-5 text-gray-600" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] bg-white">
                <div className="flex flex-col space-y-4 mt-8">
                  {/* Mobile Search */}
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      size="sm"
                      onClick={handleSearch}
                      className="bg-green-800 hover:bg-green-900"
                    >
                      Search
                    </Button>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-2">
                    {navigationLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-2 px-4 rounded-md hover:bg-green-50 transition-colors text-gray-700 hover:text-green-800"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  {/* User Section */}
                  {isAuthenticated ? (
                    <div className="space-y-2 pt-4 border-t border-gray-200">
                      <div className="px-4 py-2 text-sm text-gray-600 font-medium">
                        Welcome, {user?.name}
                      </div>
                      {userLinks.map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block py-2 px-4 rounded-md hover:bg-green-50 transition-colors text-gray-700 hover:text-green-800"
                        >
                          {link.label}
                        </Link>
                      ))}
                      {isAdmin && (
                        <>
                          <div className="px-4 py-2 text-sm text-gray-600 border-t border-gray-200 mt-2 pt-4 font-medium">
                            Admin Panel
                          </div>
                          {adminLinks.map((link) => (
                            <Link
                              key={link.path}
                              to={link.path}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block py-2 px-4 rounded-md hover:bg-green-50 transition-colors text-gray-700 hover:text-green-800"
                            >
                              {link.label}
                            </Link>
                          ))}
                        </>
                      )}
                      <Button
                        variant="ghost"
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 mt-4"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-4 border-t border-gray-200">
                      <Link
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-2 px-4 rounded-md hover:bg-green-50 transition-colors text-gray-700 hover:text-green-800"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-2 px-4 rounded-md bg-green-800 text-white hover:bg-green-900 transition-colors text-center"
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;