import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getCouponInfo } from '@/app/shared/services/services';
import { X } from 'lucide-react';

const CouponInput = ({ onCouponApplied }: any) => {

  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number, eventId: string} | null>(null);

  useEffect(() => {
    onCouponApplied(appliedCoupon);
  }, [appliedCoupon, onCouponApplied]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Por favor, introduce un código de cupón",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsValidating(true);

      const couponData = await getCouponInfo(couponCode);
      
      if (couponData.discount > 0) {
        const newCoupon = {
          code: couponCode,
          discount: couponData.discount,
          eventId: couponData.eventId,
        };
        
        setAppliedCoupon(newCoupon);
        
        toast({
          title: "Coupon applied!",
          description: `You've got a discount of ${couponData.discount}%`,
        });
        
        setIsOpen(false);
      } else {
        toast({
          title: "Invalid coupon",
          description: "This code is invalid or has alredy expired",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al validar el cupón:", error);
      toast({
        title: "Error",
        description: "The coupon code could not be validated. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <div className="w-full mt-6 flex flex-col">
      {!appliedCoupon ? (
        <>
          <Button
            variant="ghost"
            className="w-full p-0 text-gray-400 text-sm text-left h-auto hover:bg-transparent hover:text-gray-300 mt-6"
            onClick={() => setIsOpen(!isOpen)}
          >
            <u>Got a coupon? Click here to enter your code</u>
          </Button>
          
          {isOpen && (
            <div className="flex gap-2 mt-2 w-full">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Coupon code"
                className="flex-1 p-2 border border-white/10 rounded-md bg-white/5 text-white text-sm focus:outline-none focus:border-futura-teal"
              />
              <Button 
                className="bg-futura-orange hover:bg-futura-orange/90 text-white py-2 px-4 rounded-md text-sm transition-opacity"
                onClick={handleApplyCoupon}
                disabled={isValidating}
              >
                {isValidating ? 'Validating...' : 'Apply'}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="mt-4 p-3 bg-futura-teal/20 border border-futura-teal/30 rounded-md">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-futura-teal font-medium">Applied coupon: {appliedCoupon.code}</span>
              <p className="text-sm text-gray-300">Discount: {appliedCoupon.discount}%</p>
            </div>
            <Button 
              variant="ghost" 
              className="h-8 w-8 p-0 text-gray-400 hover:text-white"
              onClick={removeCoupon}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponInput;