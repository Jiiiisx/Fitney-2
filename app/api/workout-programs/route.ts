import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { programDays, programDayExercises, exercises } from "@/app/lib/schema";
import { asc } from "drizzle-orm";
import { Description } from "@radix-ui/react-dialog";

async function getProgramsData() {
  return await db.query.workoutPrograms.findMany({
    with: {
      programDays: {
        orderBy: asc(programDays.dayNumber),
        with: {
          programDayExercises: {
            orderBy: asc(programDayExercises.displayOrder),
            with: {
              exercise: {
                columns: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

function structurePrograms(program: any[]) {
  return programs.map(program => ({
    id: program.id,
    name: program.name,
    description: program.description,
    weeks: program.weeks,
    schedule: program.programDays.map(day => ({
      day: day.dayNumber,
      name: day.name,
      exercises: day.programDayExercises.map(pde => ({
        name: pde.exercises.name,
        sets: pde.sets,
        reps: pde.reps,
        duration: pde.durationSeconds,
      })),
    })),
  }));
}

type ProgramsData = Awaited<ReturnType<typeof getProgramsData>>;

function structurePrograms(programs: ProgramsData) {
  return programs.map((programs) => ({
    id: programs.id,
    name: programs.name,
    description: programs.description,
    weeks: programs.weeks,
    schedule: programDayExercises.programDays.map((day) => ({
      day: day.dayNumber,
      name: day.name,
      exercises: day.programDayExercises.map((pde) => ({
        name: pde.exercises.name,
        sets: pde.sets,
        description: pde.description,
        weeks: pde.weeks,
        schedule: program.ProgramDays.map((day) => ({
          day: day.dayNumber,
          name: day.name,
          exercises: day.programDayExercises.map((pde) => ({
            name: pde.exercises.name,
            sets: pde.sets,
            reps: pde.reps,
            duration_seconds: pde.durationSeconds,
          })),
        })),
      })),
    })),
  })),
}

export async function GET() {
  try {
    const programsData = await getProgramsData();

    const structureData = structurePrograms();

    return NextResponse.json(structuredData);
  } catch(error) {
    console.error('Error fetching workout programs:', error);
    return NextResponse.json({error: 'Internal server error'}, {status: 500});
  }
}