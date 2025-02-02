import { Heart, Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer py-2">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center text-sm">
        <div className="flex items-center space-x-4 mb-2 sm:mb-0">
          <a href="https://facebook.com" className="hover:underline flex items-center">
            <Facebook className="w-4 h-4 mr-1" /> Facebook
          </a>
          <a href="https://twitter.com" className="hover:underline flex items-center">
            <Twitter className="w-4 h-4 mr-1" /> Twitter
          </a>
          <a href="https://instagram.com" className="hover:underline flex items-center">
            <Instagram className="w-4 h-4 mr-1" /> Instagram
          </a>
        </div>
        <p className="flex items-center mb-2 sm:mb-0">
          Crafted with <Heart className="w-4 h-4 mx-1 text-red-500" /> by Your Company
        </p>
        <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
      </div>
    </footer>
  )
}
