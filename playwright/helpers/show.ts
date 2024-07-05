import { PrismaClient } from '@prisma/client';
import { addSeconds } from 'date-fns';

const prisma = new PrismaClient();

export function randomShowSlug() {
  return `test-show-${crypto.randomUUID().slice(-12)}`;
}

export async function deleteTestShows() {
  await prisma.show.deleteMany({ where: { id: { startsWith: 'test-show-' } } });
}

export async function seedShow(startDate: Date) {
  const [logoImageFile, backgroundImageFile] = await Promise.all([
    prisma.imageFile.create({
      data: {
        name: 'test-show-logo.png',
        url: 'https://placehold.co/700x200@2x.png?text=Test+Show',
      },
    }),
    prisma.imageFile.create({
      data: {
        name: 'test-show-background.jpg',
        url: 'https://placehold.co/2400.jpg',
      },
    }),
  ]);

  const show = await prisma.show.create({
    include: { sets: true },
    data: {
      name: 'Test Show',
      slug: randomShowSlug(),
      description: 'The best radio show on GitHub Actions!',
      startDate,
      backgroundColor: '#000000',
      backgroundColorSecondary: '#000000',

      logoImageFile: { connect: { id: logoImageFile.id } },
      backgroundImageFile: { connect: { id: backgroundImageFile.id } },

      sets: {
        create: {
          artist: 'Test Artist',
          offset: 0,

          audioFile: {
            create: {
              name: '5-min-silence.mp3',
              url: 'https://festivalci.z13.web.core.windows.net/5-min-silence.mp3',
              duration: 5 * 60,
              conversionStatus: 'DONE',
            },
          },
        },
      },
    },
  });

  return show;
}

export async function deleteShow(showId: string) {
  const show = await prisma.show.findUniqueOrThrow({
    where: { id: showId },
    include: { sets: true },
  });

  await prisma.show.delete({ where: { id: showId } });
  await prisma.imageFile.deleteMany({
    where: {
      id: {
        in: [show.logoImageFileId, show.backgroundImageFileId].filter(
          isDefined,
        ),
      },
    },
  });
  await prisma.audioFile.deleteMany({
    where: {
      id: {
        in: show.sets.map((set) => set.audioFileId).filter(isDefined),
      },
    },
  });
}

export async function delayShow(showId: string) {
  await prisma.show.update({
    where: { id: showId },
    data: { startDate: addSeconds(new Date(), 10) },
  });
}

function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}
