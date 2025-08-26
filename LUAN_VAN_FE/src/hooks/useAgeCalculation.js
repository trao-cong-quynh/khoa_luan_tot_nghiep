import { useMemo } from "react";

export const useAgeCalculation = (birthDate) => {
  const age = useMemo(() => {
    if (!birthDate) return null;

    try {
      const today = new Date();
      const birth = new Date(birthDate);

      // Kiểm tra nếu ngày sinh hợp lệ
      if (isNaN(birth.getTime())) return null;

      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();

      // Nếu chưa đến sinh nhật trong năm nay thì trừ đi 1 tuổi
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birth.getDate())
      ) {
        age--;
      }

      return age >= 0 ? age : null;
    } catch (error) {
      console.error("Error calculating age:", error);
      return null;
    }
  }, [birthDate]);
  return age;
};
