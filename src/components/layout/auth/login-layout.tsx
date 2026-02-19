'use client';

import { useState } from 'react';
import Cookies from 'js-cookie';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  TextInput, 
  PasswordInput, 
  Button, 
  Paper, 
  Title, 
  Container, 
  Stack, 
  Box
} from '@mantine/core';
import { loginSchema, LoginFormData } from '@/components/layout/auth/schemas/auth';
import { AuthHeader } from './auth-header';
import { loginUser } from './actions/auth.actions';
import { IoMailOutline, IoLockClosedOutline } from 'react-icons/io5';
import { useAuth } from '@/hooks/use-auth';
import { setAuthCookies } from '@/lib/auth';

export default function LoginLayout() {
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const t = useTranslations('Auth.login');
  const tVal = useTranslations('Auth.validation');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const response = await loginUser(data);

      // 1. Set cookies
      setAuthCookies(response.access_token, response.refresh_token);
      
      // 2. Update context state
      login();
      
      // 3. Redirect to /main
      router.push('/main');
      
    } catch (error: any) {
      if (error.response?.data?.message === 'wrong_email_or_password') {
         setServerError(t('error_wrong_credentials'));
      } else {
         setServerError(t('error_generic'));
      }
    }
  };

  return (
    <>
      <AuthHeader />
      <Box 
        className="min-h-screen flex items-center justify-center relative overflow-hidden transition-all duration-500"
        style={{ background: 'var(--auth-bg)' }}
      >
        {/* Ambient Background Elements */}
        <Box 
            className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full blur-[120px] pointer-events-none transition-opacity duration-500"
            style={{ backgroundColor: 'var(--auth-orb-1)' }}
        />
        <Box 
            className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full blur-[120px] pointer-events-none transition-opacity duration-500" 
            style={{ backgroundColor: 'var(--auth-orb-2)' }}
        />

        <Container size={420} w="100%" className="relative z-10">
          <Stack gap={10} align="center" mb={30}>
             <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-4">
                L
             </div>
             <Title 
                order={2} 
                className="font-sans font-bold text-3xl transition-colors duration-300"
             >
               {t('title')}
             </Title>
          </Stack>

          <Paper 
            radius="lg" 
            p={40} 
            className="backdrop-blur-xl border shadow-2xl transition-all duration-300"
            style={{
                backgroundColor: 'var(--auth-card-bg)',
                borderColor: 'var(--auth-card-border)'
            }}
          >
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack gap="md">
                <TextInput
                  label={t('email_label')}
                  placeholder="you@example.com"
                  size="md"
                  required
                  leftSection={<IoMailOutline size={18} />}
                  classNames={{
                      label: 'mb-1 font-medium',
                      input: 'focus:border-blue-500 transition-colors'
                  }}
                  error={errors.email?.message ? tVal(errors.email?.message as any) : undefined}
                  {...register('email')}
                />
                
                <PasswordInput
                    label={t('password_label')}
                    placeholder="••••••••"
                    size="md"
                    required
                    leftSection={<IoLockClosedOutline size={18} />}
                    classNames={{
                        label: 'mb-1 font-medium',
                        input: 'focus:border-blue-500 transition-colors'
                    }}
                    error={errors.password?.message ? tVal(errors.password?.message as any) : undefined}
                    {...register('password')}
                />
                
                {serverError && (
                    <Box className="p-3 rounded-md bg-red-500/10 text-red-500 text-sm text-center border border-red-500/20">
                        {serverError}
                    </Box>
                )}

                <Button 
                  fullWidth 
                  mt="sm" 
                  size="md"
                  type="submit" 
                  disabled={!isValid} 
                  loading={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 transition-all shadow-md hover:shadow-lg h-12 text-base font-semibold"
                >
                  {t('submit')}
                </Button>
              </Stack>
            </form>
          </Paper>
        </Container>
      </Box>
    </>
  );
}
