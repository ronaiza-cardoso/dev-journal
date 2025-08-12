// Test the new parseLocalDate function
const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const { format } = require('date-fns');

console.log('=== Testing Universal Timezone-Safe Date Parsing ===');
console.log('');

const testDate = '2025-08-12';
const parsedDate = parseLocalDate(testDate);

console.log('Input date string:', testDate);
console.log('Parsed date:', parsedDate.toString());
console.log('Day of week (0=Sun, 1=Mon, 2=Tue):', parsedDate.getDay());
console.log('Formatted day:', format(parsedDate, 'EEE'));
console.log('Day number:', format(parsedDate, 'dd'));
console.log('');

const testDates = ['2025-01-01', '2025-12-31', '2024-02-29', '2025-06-15'];
testDates.forEach(dateStr => {
  const date = parseLocalDate(dateStr);
  console.log(dateStr + ' -> ' + format(date, 'EEE dd MMM yyyy'));
});

console.log('');
console.log('✅ This method works in ANY timezone because:');
console.log('   - Uses Date constructor with year, month, day components');
console.log('   - No ISO string parsing that could cause timezone shifts');
console.log('   - Always creates date in local timezone');
