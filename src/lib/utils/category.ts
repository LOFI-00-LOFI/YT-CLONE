export function getCategoryId(category: string): string {
  switch (category.toLowerCase()) {
    case 'music': return '10';
    case 'gaming': return '20';
    case 'news': return '25';
    case 'sports': return '17';
    case 'learning': return '27';
    case 'fashion': return '26';
    default: return '';
  }
} 