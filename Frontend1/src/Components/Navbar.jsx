import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search, Package, LogOut, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

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
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Package className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold text-foreground">ShopScanner</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`transition-colors hover:text-primary ${
                  location.pathname === link.path
                    ? 'text-primary font-medium'
                    : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center space-x-2 flex-1 max-w-md mx-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" size="sm">
              Search
            </Button>
          </form>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart */}
            <Button variant="ghost" size="sm" asChild className="relative">
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {getItemCount() > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {getItemCount()}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
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
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center space-x-2 text-destructive">
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Cart */}
            <Button variant="ghost" size="sm" asChild className="relative">
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {getItemCount() > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {getItemCount()}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch} className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button type="submit" size="sm">
                      Search
                    </Button>
                  </form>

                  {/* Navigation Links */}
                  <div className="space-y-2">
                    {navigationLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-2 px-4 rounded-md hover:bg-accent transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  {/* User Section */}
                  {isAuthenticated ? (
                    <div className="space-y-2 pt-4 border-t">
                      <div className="px-4 py-2 text-sm text-muted-foreground">
                        Welcome, {user?.name}
                      </div>
                      {userLinks.map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block py-2 px-4 rounded-md hover:bg-accent transition-colors"
                        >
                          {link.label}
                        </Link>
                      ))}
                      {isAdmin && (
                        <>
                          <div className="px-4 py-2 text-sm text-muted-foreground border-t mt-2 pt-4">
                            Admin
                          </div>
                          {adminLinks.map((link) => (
                            <Link
                              key={link.path}
                              to={link.path}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block py-2 px-4 rounded-md hover:bg-accent transition-colors"
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
                        className="w-full justify-start text-destructive hover:text-destructive"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-4 border-t">
                      <Link
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-2 px-4 rounded-md hover:bg-accent transition-colors"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-2 px-4 rounded-md hover:bg-accent transition-colors"
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