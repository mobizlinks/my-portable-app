import inquirer from 'inquirer';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

// Load current configuration
const configPath = path.join(process.cwd(), 'src-tauri', 'tauri.conf.json');
const defaultConfigPath = path.join(process.cwd(), 'src-tauri', 'tauri.conf.default.json');
const DEFAULT_CONFIG = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf8'));

const questions = [
  {
    type: 'input',
    name: 'name',
    message: 'Please enter the application name:',
    default: DEFAULT_CONFIG.productName,
    validate: (input) => {
      if (input.trim() === '') {
        return 'Application name is required';
      }
      return true;
    }
  },
  {
    type: 'input',
    name: 'url',
    message: 'Please enter the application URL:',
    default: DEFAULT_CONFIG.app.windows[0].url,
    validate: (input) => {
      try {
        new URL(input);
        return true;
      } catch {
        return 'Please enter a valid URL';
      }
    }
  },
  {
    type: 'input',
    name: 'title',
    message: 'Please enter the window title:',
    default: DEFAULT_CONFIG.app.windows[0].title,
    validate: (input) => {
      if (input.trim() === '') {
        return 'Title is required';
      }
      return true;
    }
  },
  {
    type: 'input',
    name: 'icon',
    message: 'Please enter the path to the icon:',
    default: DEFAULT_CONFIG.bundle.icon[0]
  },
  {
    type: 'input',
    name: 'appId',
    message: 'Please enter the application ID (e.g., exampleapp):',
    default: DEFAULT_CONFIG.identifier.split('.').pop(),
    validate: (input) => {
      const validPattern = /^[a-zA-Z0-9]+$/;
      if (!validPattern.test(input)) {
        return 'Application ID can only contain alphanumeric characters';
      }
      return true;
    }
  }
];

const runBuild = async (answers) => {
  // Generate the full identifier
  const identifier = `com.mobizlinks.${answers.appId.toLowerCase()}`;

  // Update configuration
  const buildConfig = {
    ...DEFAULT_CONFIG,
    productName: answers.name,
    identifier: identifier,
    app: {
      ...DEFAULT_CONFIG.app,
      windows: [
        {
          ...DEFAULT_CONFIG.app.windows[0],
          title: answers.title,
          url: answers.url
        }
      ]
    },
    bundle: {
      ...DEFAULT_CONFIG.bundle,
      icon: [answers.icon]
    }
  };

  // Save configuration file
  fs.writeFileSync(configPath, JSON.stringify(buildConfig, null, 2));

  console.log('Build configuration:');
  console.log('- Product name:', answers.name);
  console.log('- URL:', answers.url);
  console.log('- Window title:', answers.title);
  console.log('- Icon:', answers.icon);
  console.log('- Identifier:', identifier);

  // Wrap cargo clean process in a Promise
  const cargoCleanPromise = new Promise((resolve, reject) => {
    const cargoClean = spawn('cargo', ['clean'], {
      stdio: 'inherit',
      cwd: path.join(process.cwd(), 'src-tauri'),
      shell: true
    });

    cargoClean.on('error', (error) => {
      console.error('Error occurred in cargo clean process:', error);
      reject(error);
    });

    cargoClean.on('exit', (code) => {
      if (code === 0) {
        console.log('cargo clean completed successfully.');
        resolve();
      } else {
        console.error(`cargo clean failed. Exit code: ${code}`);
        reject(new Error(`cargo clean failed. Exit code: ${code}`));
      }
    });
  });

  // Wrap build process in a Promise
  const buildProcessPromise = new Promise((resolve, reject) => {
    const buildProcess = spawn('npm', ['run', 'build'], {
      stdio: 'inherit',
      shell: true
    });

    buildProcess.on('error', (error) => {
      console.error('Error occurred in build process:', error);
      reject(error);
    });

    buildProcess.on('exit', (code) => {
      if (code === 0) {
        console.log('Build completed successfully.');
        resolve();
      } else {
        console.error(`Build failed. Exit code: ${code}`);
        reject(new Error(`Build failed. Exit code: ${code}`));
      }
    });
  });

  try {
    await cargoCleanPromise;
    await buildProcessPromise;

    // Rename and zip the built file
    const outputDir = path.join(process.cwd(), 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    const buildOutputPath = path.join(process.cwd(), 'build', 'output-file'); // Adjust this path to your actual build output
    const renamedOutputPath = path.join(outputDir, `${answers.name}.zip`);

    const output = fs.createWriteStream(renamedOutputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    output.on('close', () => {
      console.log(`Build output has been zipped and saved to ${renamedOutputPath}`);
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(output);
    archive.directory(buildOutputPath, false);
    await archive.finalize();

  } catch (error) {
    console.error('An error occurred:', error);
  }
};

console.log('Tauri application build configuration\n');

inquirer.prompt(questions)
  .then((answers) => {
    return runBuild(answers);
  })
  .catch((error) => {
    console.error('An error occurred:', error);
  }); 