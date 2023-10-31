import { test as base } from '@playwright/test';
import { PrismaClient, type Show } from '@prisma/client';
import { addSeconds } from 'date-fns';

const prisma = new PrismaClient();

interface ShowFixtures {
  show: Show;
}

export const test = base.extend<ShowFixtures>({
  show: async ({}, use) => {
    const show = await seedShow();
    await use(show);
    await deleteShow(show);
  },
});

async function seedShow(): Promise<Show> {
  const [showLogoFile, backgroundImageFile] = await Promise.all([
    prisma.file.create({
      data: {
        name: 'test-show-logo.png',
        url: 'https://placehold.co/700x200@2x.png?text=Test+Show',
      },
    }),
    prisma.file.create({
      data: {
        name: 'test-show-background.jpg',
        url: 'https://placehold.co/2400.jpg',
      },
    }),
  ]);

  const show = await prisma.show.create({
    data: {
      id: `test-show-${crypto.randomUUID().slice(-12)}`,
      name: 'Test Show',
      description: 'The best radio show on GitHub Actions!',
      startDate: addSeconds(new Date(), 10),
      backgroundColor: '#000000',
      backgroundColorSecondary: '#000000',

      showLogoFile: { connect: { id: showLogoFile.id } },
      backgroundImageFile: { connect: { id: backgroundImageFile.id } },

      sets: {
        create: {
          artist: 'Test Artist',
          offset: 0,

          audioFileUpload: {
            create: {
              status: '',
              name: '10-sec-silence.mp3',

              audioFile: {
                create: {
                  name: '10-sec-silence.mp3',
                  audioUrl:
                    'https://festivalci.z13.web.core.windows.net/10-sec-silence.mp3',
                  duration: 10,
                },
              },
            },
          },
        },
      },
    },
  });

  return show;
}

async function deleteShow(show: Show) {
  await prisma.show.delete({ where: { id: show.id } });
}
