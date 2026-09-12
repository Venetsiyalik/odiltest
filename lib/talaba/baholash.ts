/**
 * 5 balli baholash tizimi (o'zbek maktablarida keng qo'llaniladigan
 * standart chegaralar). Texnik topshiriqda aniq foizlar berilmagan —
 * shu sababli bu yerda markazlashtirilgan, kerak bo'lsa keyinchalik
 * o'zgartirish oson.
 */
export function bahoniHisoblash(ballFoiz: number): number {
  if (ballFoiz >= 90) return 5;
  if (ballFoiz >= 70) return 4;
  if (ballFoiz >= 50) return 3;
  return 2;
}
