# Node.js 기본 이미지 사용
FROM node:18

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# package.json과 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 소스 코드 복사
COPY . .

# 포트 노출
EXPOSE 3000

# 애플리케이션 실행 명령
CMD ["npm", "run", "start:prod"]