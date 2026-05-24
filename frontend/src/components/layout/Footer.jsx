const Footer = () => (
  <footer className="bg-app-text text-white mt-16">
    <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-3xl">🍕</span>
          <span className="font-extrabold text-xl">PizzaHub</span>
        </div>
        <p className="text-gray-400 text-sm">Delivering happiness, one pizza at a time. Fresh ingredients, bold flavors.</p>
      </div>
      <div>
        <h4 className="font-bold mb-3 text-accent">Quick Links</h4>
        <ul className="space-y-2 text-gray-400 text-sm">
          <li><a href="/" className="hover:text-white transition-colors">Menu</a></li>
          <li><a href="/custom-pizza" className="hover:text-white transition-colors">Build Your Pizza</a></li>
          <li><a href="/orders" className="hover:text-white transition-colors">Track Order</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold mb-3 text-accent">Contact</h4>
        <ul className="space-y-2 text-gray-400 text-sm">
          <li>📧 hello@pizzahub.com</li>
          <li>📞 +91 98765 43210</li>
          <li>📍 123 Pizza Street, Food City</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-gray-700 text-center py-4 text-gray-500 text-sm">
      © 2024 PizzaHub. Made with ❤️ and 🍕
    </div>
  </footer>
);

export default Footer;
