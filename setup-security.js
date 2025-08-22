#!/usr/bin/env node

/**
 * CoinPass 보안 설정 도우미
 * 이 스크립트는 초기 보안 설정을 도와줍니다.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

function generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}

async function setupEnvironment() {
    console.log('🔒 CoinPass 보안 설정 도우미\n');
    console.log('이 스크립트는 보안 환경 설정을 도와드립니다.\n');

    // Check if files already exist
    const envServerPath = path.join(__dirname, '.env.server');
    const envClientPath = path.join(__dirname, '.env');
    
    if (fs.existsSync(envServerPath)) {
        const overwrite = await question('.env.server 파일이 이미 존재합니다. 덮어쓰시겠습니까? (y/N): ');
        if (overwrite.toLowerCase() !== 'y') {
            console.log('기존 설정을 유지합니다.');
            rl.close();
            return;
        }
    }

    console.log('\n📋 Supabase 설정 (https://app.supabase.io 에서 확인)\n');
    
    const supabaseUrl = await question('Supabase URL: ');
    const supabaseServiceKey = await question('Supabase Service Role Key (서비스 역할 키): ');
    
    console.log('\n🔐 보안 설정\n');
    
    let jwtSecret = await question('JWT Secret (Enter를 누르면 자동 생성): ');
    if (!jwtSecret) {
        jwtSecret = generateSecureToken(32);
        console.log(`✅ JWT Secret 자동 생성됨: ${jwtSecret.substring(0, 10)}...`);
    }
    
    let sessionSecret = await question('Session Secret (Enter를 누르면 자동 생성): ');
    if (!sessionSecret) {
        sessionSecret = generateSecureToken(32);
        console.log(`✅ Session Secret 자동 생성됨: ${sessionSecret.substring(0, 10)}...`);
    }

    console.log('\n🌐 서버 설정\n');
    
    const apiPort = await question('API 서버 포트 (기본값: 3001): ') || '3001';
    const nodeEnv = await question('환경 (development/production, 기본값: production): ') || 'production';
    
    console.log('\n📧 관리자 설정 (선택사항, Enter로 건너뛰기)\n');
    
    const adminEmail = await question('관리자 이메일: ');
    
    // Create .env.server file
    const envServerContent = `# Server-side environment variables
# Generated on ${new Date().toISOString()}

# Supabase Configuration (Server-side only)
SUPABASE_URL=${supabaseUrl}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}

# Security
JWT_SECRET=${jwtSecret}
SESSION_SECRET=${sessionSecret}

# API Server Configuration
API_PORT=${apiPort}
NODE_ENV=${nodeEnv}

# Session Configuration
SESSION_MAX_AGE=86400000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Origins (comma separated)
ALLOWED_ORIGINS=http://localhost:3000,https://coinpass.kr,https://www.coinpass.kr

${adminEmail ? `# Admin Configuration\nADMIN_EMAIL=${adminEmail}` : ''}
`;

    // Create .env client file
    const envClientContent = `# Client-side environment variables
# Generated on ${new Date().toISOString()}

# API Server URL
VITE_API_URL=${nodeEnv === 'production' ? 'https://api.coinpass.kr/api' : `http://localhost:${apiPort}/api`}

# Public configuration
VITE_APP_NAME=CoinPass
VITE_APP_URL=https://coinpass.kr

# Feature flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=${nodeEnv === 'development' ? 'true' : 'false'}
`;

    // Write files
    fs.writeFileSync(envServerPath, envServerContent);
    console.log(`\n✅ .env.server 파일이 생성되었습니다.`);
    
    fs.writeFileSync(envClientPath, envClientContent);
    console.log(`✅ .env 파일이 생성되었습니다.`);

    // Update .gitignore
    const gitignorePath = path.join(__dirname, '.gitignore');
    let gitignoreContent = '';
    
    if (fs.existsSync(gitignorePath)) {
        gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
    }
    
    const requiredIgnores = ['.env', '.env.server', '.env.local', '.env.*.local'];
    const missingIgnores = requiredIgnores.filter(ignore => !gitignoreContent.includes(ignore));
    
    if (missingIgnores.length > 0) {
        gitignoreContent += '\n# Security - Never commit these files\n';
        missingIgnores.forEach(ignore => {
            gitignoreContent += `${ignore}\n`;
        });
        fs.writeFileSync(gitignorePath, gitignoreContent);
        console.log(`✅ .gitignore가 업데이트되었습니다.`);
    }

    console.log('\n🎉 설정이 완료되었습니다!\n');
    console.log('다음 단계:');
    console.log('1. Supabase 대시보드에서 setup-rls-policies.sql 실행');
    console.log('2. npm run dev:all 명령으로 개발 서버 실행');
    console.log('3. http://localhost:3000 에서 애플리케이션 확인\n');
    
    console.log('⚠️  보안 주의사항:');
    console.log('- .env.server 파일을 절대 커밋하지 마세요');
    console.log('- 프로덕션 환경에서는 HTTPS를 사용하세요');
    console.log('- 정기적으로 보안 업데이트를 확인하세요\n');

    rl.close();
}

// Run the setup
setupEnvironment().catch(error => {
    console.error('❌ 설정 중 오류가 발생했습니다:', error);
    rl.close();
    process.exit(1);
});