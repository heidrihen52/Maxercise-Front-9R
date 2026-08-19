import { getExercisesForUser } from './src/services/exercise.service';
async function run() {
  const ex = await getExercisesForUser(1); // User 1 is SUPER
  console.log(ex.slice(0, 5).map(e => e.difficulty));
  process.exit(0);
}
run();
