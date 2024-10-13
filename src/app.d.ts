// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			session?: {
				id: string; // jti
				userId: string; // sub
				expiresAt: Date; // exp
				roles: ReadonlySet<Role>;
				isAdmin: boolean;
				profile: boolean;
			};
		}
		interface PageData {
			pageTitle: string;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
