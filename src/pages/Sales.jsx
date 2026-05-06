import React, { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiMinus, FiX, FiCheck, FiSend, FiSave, FiShare2, FiArrowLeft, FiPackage } from 'react-icons/fi';

const Sales = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [paymentType, setPaymentType] = useState('Naqd');
  const [paidAmount, setPaidAmount] = useState('');
  const [showCompletion, setShowCompletion] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [products, setProducts] = useState([]);

  // Mock data
  useEffect(() => {
    const mockProducts = [
      { id: 1, name: 'Oddiy balon', price: 5000, stock: 10 },
      { id: 2, name: 'Folga balon', price: 15000, stock: 5 },
      { id: 3, name: 'Geliy xizmat', price: 20000, stock: 1 },
      { id: 4, name: 'Katta figurniy balon', price: 25000, stock: 3 },
      { id: 5, name: 'Bezak to\'plami', price: 8000, stock: 8 },
      { id: 6, name: 'Rangli folga', price: 12000, stock: 6 },
    ];
    setProducts(mockProducts);
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product) => {
    if (product.stock === 0) return;
    
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setCart(cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, change) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) return item;
        if (newQuantity <= item.stock) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getRemainingDebt = () => {
    const total = getTotal();
    const paid = parseFloat(paidAmount) || 0;
    return Math.max(0, total - paid);
  };

  const handleCompleteSale = () => {
    if (cart.length === 0) return;
    setShowCompletion(true);
  };

  const handleViewReceipt = () => {
    setShowCompletion(false);
    setShowReceipt(true);
  };

  const handleNewSale = () => {
    setShowCompletion(false);
    setShowReceipt(false);
    setCart([]);
    setPaidAmount('');
    setPaymentType('Naqd');
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString('uz-UZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Sale Completion Screen
  if (showCompletion) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm animate-fade-in">
          <div className="text-center">
            {/* Green Checkmark */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheck className="w-12 h-12 text-green-600" />
            </div>
            
            {/* Total Amount */}
            <div className="mb-8">
              <p className="text-4xl font-bold text-gray-900">{getTotal().toLocaleString()} so'm</p>
            </div>
            
            {/* Success Message */}
            <p className="text-xl font-semibold text-gray-900 mb-8">Sotuv yakunlandi</p>
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleViewReceipt}
                className="w-full py-4 bg-purple-600 text-white rounded-2xl font-semibold hover:bg-purple-700 transition-colors"
              >
                Chekni ko'rish
              </button>
              <button
                onClick={handleNewSale}
                className="w-full py-4 border border-gray-300 text-gray-700 rounded-2xl font-medium hover:bg-gray-50 transition-colors"
              >
                Yangi sotuv
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Receipt Screen
  if (showReceipt) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setShowReceipt(false)}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FiArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-gray-900">Chek (POF)</h2>
            <div className="w-6 h-6" />
          </div>
          
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">BalonCRM Sotuv cheki</h3>
          </div>

          {/* Customer Info */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-1">Sana: {getCurrentDateTime()}</p>
            {selectedCustomer && (
              <>
                <p className="text-sm text-gray-600 mb-1">Mijoz: {selectedCustomer.name}</p>
                <p className="text-sm text-gray-600">Telefon: {selectedCustomer.phone}</p>
              </>
            )}
          </div>

          {/* Products Table */}
          <div className="mb-6">
            <div className="grid grid-cols-4 gap-2 text-sm font-medium text-gray-700 mb-2">
              <div>Mahsulot</div>
              <div className="text-center">Miqdor</div>
              <div className="text-center">Narx</div>
              <div className="text-right">Jami</div>
            </div>
            <div className="space-y-1">
              {cart.map((item) => (
                <div key={item.id} className="grid grid-cols-4 gap-2 text-sm py-2 border-b border-gray-100">
                  <div>{item.name}</div>
                  <div className="text-center">{item.quantity}</div>
                  <div className="text-center">{item.price.toLocaleString()}</div>
                  <div className="text-right font-medium">{(item.price * item.quantity).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="mb-6">
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Jami:</span>
              <span>{getTotal().toLocaleString()} so'm</span>
            </div>
          </div>

          {/* Payment Type */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">To'lov turi: {paymentType}</p>
          </div>

          {/* Thank You Message */}
          <div className="text-center mb-6">
            <p className="text-lg font-medium text-gray-900">Rahmat!</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center justify-center">
              <FiSend className="w-4 h-4 mr-2" />
              PDF yuborish
            </button>
            <button className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center">
              <FiShare2 className="w-4 h-4 mr-2" />
              Ulashish
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Sales Interface
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sotuv Bo'limi</h1>
            <p className="text-sm text-gray-500">Yangi buyurtma rasmiylashtirish</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 bg-gray-50 rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
              <FiSave className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Customer Selection */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Mijozni tanlash</label>
          <select
            value={selectedCustomer?.id || ''}
            onChange={(e) => {
              const customerId = e.target.value;
              if (customerId === 'new') {
                setSelectedCustomer({ id: 'new', name: 'Yangi mijoz', phone: '' });
              } else {
                const customer = { id: customerId, name: `Mijoz ${customerId}`, phone: `+998 ${customerId}0000000` };
                setSelectedCustomer(customer);
              }
            }}
            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-purple-500 transition-all text-gray-900 font-medium text-base"
          >
            <option value="">Mijozni tanlang...</option>
            <option value="1">Ali Valiyev</option>
            <option value="2">Bekzod Karimov</option>
            <option value="3">Dilnoza Azizova</option>
            <option value="new">+ Yangi mijoz qo'shish</option>
          </select>
        </div>

        {/* Product Selection (Warehouse) */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Mahsulotlar</h3>
            <div className="relative flex-1 max-w-[200px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 rounded-xl text-xs border-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                onClick={() => product.stock > 0 && addToCart(product)}
                className={`group cursor-pointer bg-white rounded-2xl p-3 border border-gray-100 transition-all duration-200 ${
                  product.stock === 0 ? 'opacity-50' : 'hover:border-purple-500 hover:shadow-md active:scale-95'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                    <FiPackage className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                    product.stock === 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {product.stock === 0 ? 'Yo\'q' : `${product.stock} dona`}
                  </span>
                </div>
                
                <h4 className="font-semibold text-gray-800 text-xs mb-1 truncate">{product.name}</h4>
                <div className="flex items-center justify-between">
                  <p className="text-purple-600 font-bold text-sm">{product.price.toLocaleString()}</p>
                  <button className="w-6 h-6 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <FiPlus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart */}
        {cart.length > 0 && (
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">Savatcha</h3>
              <span className="bg-purple-50 text-purple-600 px-3 py-1 rounded-xl text-xs font-bold">{cart.length} ta mahsulot</span>
            </div>
            
            <div className="space-y-6">
              {cart.map((item) => (
                <div key={item.id} className="pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                  {/* Top: Details */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-base mb-1 leading-tight">{item.name}</h4>
                      <p className="text-sm text-gray-400 font-medium">{item.price.toLocaleString()} so'm / dona</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-gray-300 hover:text-rose-500 transition-colors"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Bottom: Controls & Total */}
                  <div className="flex items-center justify-between bg-gray-50/50 p-3 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-white rounded-xl border border-gray-100 p-1 shadow-sm">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                        >
                          <FiMinus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-bold text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                        >
                          <FiPlus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Jami</p>
                      <p className="text-lg font-bold text-purple-600">
                        {(item.price * item.quantity).toLocaleString()} <span className="text-xs font-medium opacity-60">so'm</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment and Total */}
        {cart.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {['Naqd', 'Nasiya', 'Qisman'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setPaymentType(type)}
                    className={`py-2 px-3 rounded-xl font-medium transition-colors ${
                      paymentType === type
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              
              {paymentType === 'Qisman' && (
                <input
                  type="number"
                  placeholder="To'langan summa"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              )}
              
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Jami:</span>
                  <span>{getTotal().toLocaleString()} so'm</span>
                </div>
                {(paymentType === 'Qisman' && paidAmount) && (
                  <div className="flex justify-between text-sm">
                    <span>Qarz:</span>
                    <span className="text-red-600">{getRemainingDebt().toLocaleString()} so'm</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {cart.length > 0 && (
          <button
            onClick={handleCompleteSale}
            className="w-full py-4 bg-purple-600 text-white rounded-2xl font-semibold hover:bg-purple-700 transition-colors shadow-lg"
          >
            Sotuvni yakunlash
          </button>
        )}
      </div>
    </div>
  );
};

export default Sales;
