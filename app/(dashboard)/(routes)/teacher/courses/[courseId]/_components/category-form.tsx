'use client';

import * as z from 'zod';
import axios from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Course } from '@prisma/client';
import { Combobox } from '@/components/ui/combobox';
import { useTheme } from 'next-themes';

interface CategoryFormProps {
	initialData: Course;
	courseId: string;
	options: { label: string; value: string }[];
}

const formSchema = z.object({
	categoryId: z.string().min(1, {
		message: 'Description is required',
	}),
});

const CategoryForm = ({
	initialData,
	courseId,
	options,
}: CategoryFormProps) => {
	const [isEditing, setIsEditing] = useState(false);

	const toggleEdit = () => setIsEditing((prev) => !prev);

	const router = useRouter();
	const {resolvedTheme} = useTheme()

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			categoryId: initialData.categoryId || '',
		},
	});

	const { isSubmitting, isValid } = form.formState;

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			await axios.patch(`/api/courses/${courseId}`, values);

			toast.success('Course updated');
			toggleEdit();
			router.refresh();
		} catch (error) {
			toast.error('Something went wrong');
		}
	};

	const selectedOption = options.find(
		(option) => option.value === initialData.categoryId
	);

	return (
		<div className={`mt-6 border ${resolvedTheme === 'dark' ? "bg-slate-800" : "bg-slate-100"} rounded-md p-4`}>
			<div className="font-medium flex items-center justify-between">
				Course category
				<Button variant={'ghost'} onClick={toggleEdit}>
					{isEditing ? (
						<>Cancel</>
					) : (
						<>
							<Pencil className="h-4 w-4 mr-2" />
							Edit category
						</>
					)}
				</Button>
			</div>

			{!isEditing && (
				<p
					className={cn(
						'text-sm mt-2',
						!initialData.categoryId && 'text-slate-500 italic'
					)}
				>
					{selectedOption?.label || 'No category'}
				</p>
			)}

			{isEditing && (
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4 mt-4"
					>
						<FormField
							control={form.control}
							name="categoryId"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Combobox
											options={options}
											value={field.value}
											onChange={field.onChange}
										/>
									</FormControl>

									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex items-center gap-x-2">
							<Button disabled={!isValid || isSubmitting} type="submit">
								Save
							</Button>
						</div>
					</form>
				</Form>
			)}
		</div>
	);
};

export default CategoryForm;
