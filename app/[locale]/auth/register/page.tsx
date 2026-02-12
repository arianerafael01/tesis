import { Link } from '@/i18n/routing';
import RegForm from "@/components/partials/auth/reg-form";
import Image from "next/image";
import Logo from "@/components/partials/auth/logo";
import Social from "@/components/partials/auth/social";
const Register = () => {
  return (
    <>
      <div className="flex w-full items-center overflow-hidden min-h-dvh h-dvh basis-full">
        <div className="overflow-y-auto flex flex-wrap w-full h-dvh">
          <div
            className="lg:block hidden flex-1 overflow-hidden text-[40px] leading-[48px] text-default-600 relative z-1 bg-default-50">
            <div className="absolute left-0 bottom-[-130px] h-full w-full z-[-1]">
              <Image
                src="/images/auth/login-institutional.png"
                alt=""
                priority
                width={300}
                height={300}
                className="mb-10 w-full h-full"
              />
            </div>
          </div>
          <div className="flex-1 relative dark:bg-default-100 bg-white ">
            <div className=" h-full flex flex-col">
              <div className="max-w-[524px] md:px-[42px] md:py-[44px] p-7  mx-auto w-full text-2xl text-default-900  mb-3 h-full flex flex-col justify-center">
                <div className="flex justify-center items-center text-center mb-6 lg:hidden ">
                  <Link href="/">
                    <Logo />
                  </Link>
                </div>
                <div className="text-center 2xl:mb-10 mb-5">
                  <h4 className="font-medium">Sign up</h4>
                  <div className="text-default-500  text-base">
                    Crear cuenta para acceder al sistema
                  </div>
                </div>
                <RegForm />
                <div className=" relative border-b-[#9AA2AF] border-opacity-[16%] border-b pt-6">
                  <div className=" absolute inline-block  bg-default-50 dark:bg-default-100 left-1/2 top-1/2 transform -translate-x-1/2 px-4 min-w-max text-sm  text-default-500  font-normal ">
                    Or continue with
                  </div>
                </div>
                <div className="max-w-[242px] mx-auto mt-8 w-full">
                  <Social locale={""} />
                </div>
                <div className="max-w-[225px] mx-auto font-normal text-default-500  2xl:mt-12 mt-6 uppercase text-sm">
                  Already registered?
                  <Link
                    href="/auth/login"
                    className="text-default-900  font-medium hover:underline"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
